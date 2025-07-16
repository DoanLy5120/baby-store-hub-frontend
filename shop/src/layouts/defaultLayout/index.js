import Header from '../../components/header'
import Footer from '../../components/footer';

function DefaultLayout({children}) {
    return <div className="container">
        <Header />
        <div>{children}</div>
        <Footer />
    </div>
}

export default DefaultLayout;