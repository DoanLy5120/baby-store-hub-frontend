import { DefaultLayout, EmptyLayout, ManagerLayout } from "../layouts";
// import HomePage from "../page/public/HomePage/index";
import Info from "../page/customer/Info";
import Login from "../page/public/loginPage";
import Register from "../page/public/registerPage";
import Overview from "../page/manager/Overview/index";
import Selling from "../page/manager/Selling/index";
import Bill from "../page/manager/Bill/index";
import Category from "../page/manager/Category/index";
import Product from "../page/manager/Product/index";

const publicRoutes = [
  // { path: "/", component: HomePage, layout: DefaultLayout },
  { path: "/", component: Login, layout: EmptyLayout, publicOnly: true },//sau này nhớ đổi thành /login
  {
    path: "/register",
    component: Register,
    layout: EmptyLayout,
    publicOnly: true,
  },
];

const privateRoutes = [
  { path: "/info", component: Info, layout: EmptyLayout },
  { path: "/manager", component: Overview, layout: ManagerLayout },
  { path: "/manager/ban-hang", component: Selling, layout: ManagerLayout },
  { path: "/manager/giao-dich/hoa-don", component: Bill, layout: null },
  { path: "/manager/hang-hoa/danh-muc", component: Category, layout: null },
  { path: "/manager/hang-hoa/san-pham", component: Product, layout: null },
];

export { publicRoutes, privateRoutes };
