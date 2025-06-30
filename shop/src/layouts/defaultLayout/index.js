import Header from '../../components/header'

function DefaultLayout({children}) {
    return <div className="container">
        <Header />
        <div>{children}</div>
    </div>
}

export default DefaultLayout;