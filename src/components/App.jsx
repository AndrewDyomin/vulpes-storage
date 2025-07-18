import { useEffect, lazy, Suspense } from 'react';
import { useDispatch } from 'react-redux';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from './Layout';
import { PrivateRoute } from './PrivateRoute';
import { RestrictedRoute } from './RestrictedRoute';
import { refreshUser } from '../redux/auth/operations';
import { useAuth } from 'hooks';
import { Loading } from './Loading/Loading';

const HomePage = lazy(() => import('../pages/Home'));
const RegisterPage = lazy(() => import('../pages/Register'));
const LoginPage = lazy(() => import('../pages/Login'));
const ProductsPage = lazy(() => import('../pages/Products'));
const MyRoomPage = lazy(() => import('../pages/MyRoom'));
const ScannerPage = lazy(() => import('../pages/Scanner'));
const ShippingPage = lazy(() => import('../pages/Shipping'));
const InventoryCheckPage = lazy(() => import('../pages/InventoryCheck'));
const InventoryDetailsPage = lazy(() => import('../pages/InventoryDetails'));
const GetProductsInPage = lazy(() => import('../pages/GetProductsIn'));
const ReceiveProductsDetailsPage = lazy(() => import('../pages/ReceiveProductsDetails'));
const AutomaticActionsPage = lazy(() => import('../pages/AutomaticActions'));
const UsersPage = lazy(() => import('../pages/Users'));

export const App = () => {
  const dispatch = useDispatch();
  const { isRefreshing } = useAuth();

  useEffect(() => {
    dispatch(refreshUser());
  }, [dispatch]);

  return isRefreshing ? (
    <Loading />
  ) : (
    <Suspense>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route
            path="/register"
            element={
              <RestrictedRoute redirectTo="/" component={<RegisterPage />} />
            }
          />
          <Route
            path="/login"
            element={
              <RestrictedRoute redirectTo="/" component={<LoginPage />} />
            }
          />
          <Route
            path="/products"
            element={<ProductsPage />}
          />
          <Route
            path="/room"
            element={
              <PrivateRoute redirectTo="/login" component={<MyRoomPage />} />
            }
          />
          <Route
            path="/scanner"
            element={
              <PrivateRoute redirectTo="/login" component={<ScannerPage />} />
            }
          />
          <Route
            path="/shipping"
            element={
              <PrivateRoute redirectTo="/login" component={<ShippingPage />} />
            }
          />
          <Route
            path="/inventory-check"
            element={
              <PrivateRoute redirectTo="/login" component={<InventoryCheckPage />} />
            }
          />
          <Route
            path="/inventory-check/:inventoryId"
            element={
              <PrivateRoute
                redirectTo="/login"
                component={<InventoryDetailsPage />}
              />
            }
          />
          <Route
            path="/get-products-in/"
            element={
              <PrivateRoute
                redirectTo="/login"
                component={<GetProductsInPage />}
              />
            }
          />
          <Route
            path="/get-products-in/:receiveId"
            element={
              <PrivateRoute
                redirectTo="/login"
                component={<ReceiveProductsDetailsPage />}
              />
            }
          />
          <Route
            path="/automatic-actions/"
            element={
              <PrivateRoute
                redirectTo="/login"
                component={<AutomaticActionsPage />}
              />
            }
          />
          <Route
            path="/users/"
            element={
              <PrivateRoute
                redirectTo="/login"
                component={<UsersPage />}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </Suspense>
  );
};
