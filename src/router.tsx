import { createBrowserRouter } from 'react-router'

import Layout from './components/Layout/Layout'
import Index from './pages/Index'
import Login from './pages/Login'
import Notfound from './pages/Notfound'

// Users
import UserList from './pages/Users/UserList/index'
import UserSpecific from './pages/Users/UserSpecific/index'
import EditUser from './pages/Users/EditUser/index'

// Product
import ProductList from './pages/Product/ProductList/index'
import ProductSpecific from './pages/Product/ProductSpecific'
import NewProduct from './pages/Product/NewProduct'
import EditProduct from './pages/Product/EditProduct'
import CategoriesPage from './pages/Product/Category'

import CourseList from './pages/Course/CourseList'
import CourseSpecific from './pages/Course/CourseSpecific'
import NewCourse from './pages/Course/NewCourse'
import EditCourse from './pages/Course/EditCourse'
import OrderList from './pages/Orders/OrderLists'

// coach section
import CoachPage from './pages/Coach'
import CoachCourseProgramPage from './pages/Coach/CoachCourseProgram'
import CreateCoachCoursePage from './pages/Coach/CoachCourseProgram/Create'
import SpecificCoachCoursePage from './pages/Coach/CoachCourseProgram/Specific'
import SpecificCoachPage from './pages/Coach/SpecificCoach'
import CourseCategoriesPage from './pages/Course/Category'

// Course Session Package
import CourseSessionPackages from './pages/CourseSessionPackages'

// Transaction
import TransactionList from './pages/Transaction/TransactionList'
import TransactionSpecific from './pages/Transaction/SpecificTransaction'
import CourseSessionList from './pages/CourseSession/CourseSessionList'
import CourseSessionSpecific from './pages/CourseSession/CourseSessionSpecific'
import CreateCourseSession from './pages/CourseSession/CreateCourseSession'
import CourseAssignCoach from './pages/CourseSession/CourseAssignCoach'
import CreateCoupon from './pages/Coupon/CreateCoupon'
import NewCoach from './pages/Coach/NewCoach'
import EditCourseSession from './pages/CourseSession/EditCourseSession'
import ClassRoom from './pages/ClassRoom'
import CouponList from './pages/Coupon/CouponList'
import CourseSessionProgramList from './pages/CourseSessionProgram/CourseSessionProgramList'
import CourseSessionProgramSpecific from './pages/CourseSessionProgram/CourseSessionProgramSpecific'


// Course Session Program Orders
import CourseSessionProgramOrdersList from './pages/CourseSessionProgramOrder/ProgramOrderList';
import ProgramOrderSpecific from './pages/CourseSessionProgramOrder/ProgramOrderSpecific'

import TestUserList from './pages/Users/UserList';
import CreateUser from './pages/Users/CreateUser'
import NotificationPage from './pages/Notification/NotificationHome'
import NotificationSpecific from './pages/Notification/NotificationSpecific'
import TicketList from './pages/Ticket/TicketList'
import TicketSpecific from './pages/Ticket/TicketSpecific'
import CategoryPage from './pages/Category';
import CreateCampaign from './pages/Campain/CreateCampain'
import BlogList from './pages/Blog/BlogList'
import CreateBlog from './pages/Blog/CreateBlog'
import EditBlog from './pages/Blog/EditBlog'


const router = createBrowserRouter(
  [
    {
      path: '/',
      element: (
        <Layout>
          <Index />
        </Layout>
      ),
    },
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/users',
      element: (
        <Layout>
          <TestUserList />
        </Layout>
      ),
    },
    {
      path: '/users/create',
      element: (
        <Layout>
          <CreateUser />
        </Layout>
      ),
    },
    {
      path: '/users/:user_id',
      element: (
        <Layout>
          <UserSpecific />
        </Layout>
      ),
    },
    {
      path: '/users/:user_id/edit',
      element: (
        <Layout>
          <EditUser />
        </Layout>
      ),
    },
    {
      path: '/products',
      element: (
        <Layout>
          <ProductList />
        </Layout>
      ),
    },
    {
      path: '/products/:product_id',
      element: (
        <Layout>
          <ProductSpecific />
        </Layout>
      ),
    },
    {
      path: '/products/new',
      element: (
        <Layout>
          <NewProduct />
        </Layout>
      ),
    },
    {
      path: '/products/:product_id/edit',
      element: (
        <Layout>
          <EditProduct />
        </Layout>
      ),
    },
    {
      path: '/products-category',
      element: (
        <Layout>
          <CategoriesPage />
        </Layout>
      ),
    },
    {
      path: '/course-category',
      element: (
        <Layout>
          <CourseCategoriesPage />
        </Layout>
      ),
    },
    {
      path: '/courses',
      element: (
        <Layout>
          <CourseList />
        </Layout>
      ),
    },
    {
      path: '/courses/:course_id',
      element: (
        <Layout>
          <CourseSpecific />
        </Layout>
      ),
    },
    {
      path: '/courses/new',
      element: (
        <Layout>
          <NewCourse />
        </Layout>
      ),
    },
    {
      path: '/courses/:course_id/edit',
      element: (
        <Layout>
          <EditCourse />
        </Layout>
      ),
    },
    {
      path: '/courses-sessions',
      element: (
        <Layout>
          <CourseSessionList />
        </Layout>
      ),
    },
    {
      path: '/courses-sessions/create',
      element: (
        <Layout>
          <CreateCourseSession />
        </Layout>
      ),
    },
    {
      path: '/courses-sessions/:course_id',
      element: (
        <Layout>
          <CourseSessionSpecific />
        </Layout>
      ),
    },
    {
      path: '/courses-sessions/:course_id/edit',
      element: (
        <Layout>
          <EditCourseSession />
        </Layout>
      ),
    },
    {
      path: '/courses-sessions/:course_id/assign-coach',
      element: (
        <Layout>
          <CourseAssignCoach />
        </Layout>
      ),
    },
    {
      path: '/courses-sessions/implement-package',
      element: (
        <Layout>
          <CourseSessionPackages />
        </Layout>
      ),
    },
    {
      path: '/course-session-program',
      element: (
        <Layout>
          <CourseSessionProgramList />
        </Layout>
      ),
    },
    {
      path: '/course-session-program/:id',
      element: (
        <Layout>
          <CourseSessionProgramSpecific />
        </Layout>
      ),
    },
    {
      path: '/course-session-program/orders',
      element: (
        <Layout>
          <CourseSessionProgramOrdersList />
        </Layout>
      ),
    },
    {
      path: '/course-session-program/orders/:order_id',
      element: (
        <Layout>
          <ProgramOrderSpecific />
        </Layout>
      ),
    },
    {
      path: '/class-room',
      element: (
        <Layout>
          <ClassRoom />
        </Layout>
      ),
    },
    {
      path: '/coupon',
      element: (
        <Layout>
          <CouponList />
        </Layout>
      ),
    },
    {
      path: '/coupon/create',
      element: (
        <Layout>
          <CreateCoupon />
        </Layout>
      ),
    },
    {
      path: '/coach/new',
      element: (
        <Layout>
          <NewCoach />
        </Layout>
      ),
    },
    {
      path: '/orders',
      element: (
        <Layout>
          <OrderList />
        </Layout>
      ),
    },
    {
      path: '/transactions',
      element: (
        <Layout>
          <TransactionList />
        </Layout>
      ),
    },
    {
      path: '/transactions/:transaction_id',
      element: (
        <Layout>
          <TransactionSpecific />
        </Layout>
      ),
    },
    {
      path: '/coach',
      element: (
        <Layout>
          <CoachPage />
        </Layout>
      ),
    },
    {
      path: '/coach/:id',
      element: (
        <Layout>
          <SpecificCoachPage />
        </Layout>
      ),
    },
    {
      path: '/coach/coach-course-program',
      element: (
        <Layout>
          <CoachCourseProgramPage />
        </Layout>
      ),
    },
    {
      path: '/coach/coach-course-program/create',
      element: (
        <Layout>
          <CreateCoachCoursePage />
        </Layout>
      ),
    },
    {
      path: '/coach/coach-course-program/get/:id',
      element: (
        <Layout>
          <SpecificCoachCoursePage />
        </Layout>
      ),
    },
    {
      path: '/notifications',
      element: (
        <Layout>
          <NotificationPage />
        </Layout>
      ),
    },
    {
      path: '/notifications/:notification_id',
      element: (
        <Layout>
          <NotificationSpecific />
        </Layout>
      ),
    },
    {
      path: '/tickets',
      element: (
        <Layout>
          <TicketList />
        </Layout>
      ),
    },
    {
      path: '/tickets/:ticket_id',
      element: (
        <Layout>
          <TicketSpecific />
        </Layout>
      ),
    },
    {
      path: '/category',
      element: (
        <Layout>
          <CategoryPage />
        </Layout>
      ),
    },
    {
      path: '/campaign/create',
      element: (
        <Layout>
          <CreateCampaign />
        </Layout>
      ),
    },
    {
      path: '/blog',
      element: (
        <Layout>
          <BlogList />
        </Layout>
      ),
    },
    {
      path: '/blog/create',
      element: (
        <Layout>
          <CreateBlog />
        </Layout>
      ),
    },
    {
      path: '/blog/:blogId/edit',
      element: (
        <Layout>
          <EditBlog />
        </Layout>
      ),
    },
    {
      path: '*',
      element: (
        <Layout>
          <Notfound />
        </Layout>
      ),
    },
  ],
  {
    // basename: '/admin',
  },
)

export default router
