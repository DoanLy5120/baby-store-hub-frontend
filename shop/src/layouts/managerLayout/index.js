import HeaderManager from "../../components/manager/headerManager"

function ManagerLayout({children}) {
    return <div className="container">
        <HeaderManager />
        <div>{children}</div>
    </div>
}

export default ManagerLayout;