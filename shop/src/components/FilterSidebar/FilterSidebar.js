
import React, { useState } from "react";
import { Card, Slider, Rate, Button, Divider } from "antd";

const FilterSidebar = ({ onFilterChange }) => {
   
    const [priceRange, setPriceRange] = useState([0, 10000000]); 
    const [rating, setRating] = useState(0);

    const handleApplyFilters = () => {
        onFilterChange({
            priceRange,
            rating,
        });
    };

    return (
        
        <Card
            title="Bộ lọc tìm kiếm"
            headStyle={{
                backgroundColor: 'var(--primary)',
                color: '#fff',
                fontWeight: '600'
            }}
            style={{ 
                borderRadius: 0,                 
                border: 'none',                 
            }}
        >
          

            <Divider orientation="left">Khoảng Giá</Divider>
            <Slider
                range
                min={0}
                max={10000000}
                step={100000}
                value={priceRange}
                onChange={(value) => setPriceRange(value)}
                tipFormatter={(value) => `${value.toLocaleString()} ₫`}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span>{priceRange[0].toLocaleString()} ₫</span>
                <span>{priceRange[1].toLocaleString()} ₫</span>
            </div>

            <Divider orientation="left">Đánh giá</Divider>
            <Rate
                allowClear={true}
                value={rating}
                onChange={(value) => setRating(value || 0)}
            />
            <span style={{ marginLeft: "8px" }}>từ {rating} sao</span>

            <Button
                type="primary"
                style={{ width: "100%", marginTop: "24px" }}
                onClick={handleApplyFilters}
            >
                Áp dụng
            </Button>
        </Card>
    );
};

export default FilterSidebar;