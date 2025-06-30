import { Fragment } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { publicRoutes, privateRoutes } from "./routes";
import { DefaultLayout } from "./layouts";
import ProtectedRoute from "./routes/protectedRoute";
import PublicRoute from "./routes/publicRoute";
import "antd/dist/reset.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          {publicRoutes.map((route, index) => {
            const Page = route.component;

            let Layout;
            if (route.layout === null) {
              Layout = Fragment;
            } else if (route.layout) {
              Layout = route.layout;
            } else {
              Layout = DefaultLayout;
            }

            const element = (
              <Layout>
                <Page />
              </Layout>
            );

            return (
              <Route
                key={index}
                path={route.path}
                element={
                  route.publicOnly ? (
                    <PublicRoute>{element}</PublicRoute>
                  ) : (
                    element
                  )
                }
              />
            );
          })}

          {/* Private routes */}
          {privateRoutes.map((route, index) => {
            const Page = route.component;

            let Layout;
            if (route.layout === null) {
              Layout = Fragment;
            } else if (route.layout) {
              Layout = route.layout;
            } else {
              Layout = DefaultLayout;
            }

            return (
              <Route
                key={`private-${index}`}
                path={route.path}
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Page />
                    </Layout>
                  </ProtectedRoute>
                }
              />
            );
          })}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
