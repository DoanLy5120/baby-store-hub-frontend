import { DefaultLayout, EmptyLayout, ManagerLayout } from "../layouts";
import HomePage from "../page/public/HomePage";
import Info from "../page/customer/Info";
import Login from "../page/public/loginPage"
import Register from "../page/public/registerPage";
import Overview from "../page/manager/Overview/index";
import Selling from "../page/manager/Selling/index";

const publicRoutes = [
  { path: "/", component: HomePage, layout: DefaultLayout },
  { path: "/login", component: Login, layout: EmptyLayout, publicOnly: true },
  {path: "/register", component: Register, layout: EmptyLayout, publicOnly: true }
];

const privateRoutes = [
    {path: "/info", component: Info, layout: EmptyLayout},
    {path: "/manager", component: Overview, layout: ManagerLayout},
    {path: "/manager/ban-hang", component: Selling, layout: ManagerLayout},
];

export { publicRoutes, privateRoutes };
