
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Layout, Row, Col, Card, Rate, Empty, Spin, Pagination, Breadcrumb, Button, Tag } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import FilterSidebar from "../../../components/FilterSidebar/FilterSidebar";
import { formatVND } from "../../../utils/formatter";
import productApi from "../../../api/productApi"; 
import { Link } from "react-router-dom"; 
import "./searchResultsPage.scss";

const { Content } = Layout;
const { Meta } = Card;
const getAgeTagColor = (ageText) => {
    if (ageText.includes("0-3")) return "green";
    if (ageText.includes("3-6")) return "blue";
    if (ageText.includes("6-12")) return "purple";
    return "default"; 
};
const SearchResultsPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const keyword = searchParams.get("q");

    const [originalProducts, setOriginalProducts] = useState([]); 
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
        total: 0,
    });

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!keyword) {
                setProducts([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const response = await productApi.searchHeader(keyword);
                console.log("Thuoc tinh cua san pham: ", response.data);
                const productData = response.data || []; 
                setProducts(productData);
                setOriginalProducts(productData);
                setPagination(prev => ({ ...prev, total: productData.length, current: 1 }));
            } catch (error) {
                console.error("Lỗi khi tải kết quả tìm kiếm:", error);
                setProducts([]);
                setOriginalProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [keyword]); 


    const handleProductClick = (productId) => {
        navigate(`/san-pham/${productId}`);
    };

    const handleFilterChange = (filters) => {
        setLoading(true); 
        let filteredData = [...originalProducts];

        
        const [minPrice, maxPrice] = filters.priceRange;
        filteredData = filteredData.filter(p => {
            const priceWithVAT = p.giaBan * (1 + p.VAT / 100);
            return priceWithVAT >= minPrice && priceWithVAT <= maxPrice;
        });

       
        // const minRating = filters.rating;
        // if (minRating > 0) {
        //     filteredData = filteredData.filter(p => p.rating >= minRating); 
        // }

      
        setProducts(filteredData);
        setPagination(prev => ({ ...prev, total: filteredData.length, current: 1 }));
    
        setTimeout(() => setLoading(false), 300);
    };

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, current: page }));
        window.scrollTo(0, 0);
    };

    const currentProducts = products.slice(
        (pagination.current - 1) * pagination.pageSize,
        pagination.current * pagination.pageSize
    );

    return (
        <div className="search-results-page">
            <div className="sidebar">
                <FilterSidebar onFilterChange={handleFilterChange} />
            </div>

           
            <div className="main-content-search">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/"><HomeOutlined /><span> Trang chủ</span></Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <span>Tìm kiếm</span>
                    </Breadcrumb.Item>
                </Breadcrumb>
                <div className="page-title">
                    <h1>
                        Kết quả tìm kiếm cho từ khóa: "<span>{keyword}</span>"
                    </h1>
                </div>
                <div className="product-list-container">
                    {loading ? (
                        <div className="loader"><Spin size="large" /></div>
                    ) : products.length > 0 ? (
                        <>
                            <Row gutter={[16, 16]}>
                                {currentProducts.map((product, index) => (
                                    <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                                        <Card
                                            hoverable
                                            className="product-card-result"
                                            onClick={() => handleProductClick(product.id)}
                                            cover={
                                                <div className="product-image-container">
                                                    <img alt={product.tenSanPham} src={`http://127.0.0.1:8000/storage/${product.hinhAnh}`} />
                                                    <Tag className="age-tag" color="blue">
                                                        {product.ageRange || `${index % 3 === 0 ? "3-6" : "0-3"} tuổi`}
                                                    </Tag>
                                                </div>
                                            }
                                        >
                                            
                                            <Meta
                                                title={product.tenSanPham}
                                                description={
                                                     <>
                                      <div className="product-price">
                                          {formatVND(product.giaBan * (1 + product.VAT / 100))}
                                             </div>
                                            <div className="product-meta">
                                                   <Rate disabled defaultValue={5} style={{ fontSize: '14px' }} />
                                                  <span className="sold-status">Đã bán 1.2k</span>
                                                    </div>
                                                             </>
                                                               }
                                            />
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                            <Pagination
                                className="pagination"
                                current={pagination.current}
                                pageSize={pagination.pageSize}
                                total={pagination.total}
                                onChange={handlePageChange}
                                showSizeChanger={false}
                            />
                        </>
                    ) : (
                        <Empty description="Không tìm thấy sản phẩm nào phù hợp." />
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchResultsPage;