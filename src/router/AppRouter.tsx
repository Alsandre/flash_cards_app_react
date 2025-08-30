import React from "react";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {AppLayout} from "../components/layout/AppLayout";
import {Dashboard} from "../pages/Dashboard";
import {GroupDetail} from "../pages/GroupDetail";
import {StudySession} from "../pages/StudySession";
import {Stats} from "../pages/Stats";
import {Settings} from "../pages/Settings";
import {DevTest} from "../pages/DevTest";
import {CreateGroup} from "../pages/CreateGroup";
import {EditGroup} from "../pages/EditGroup";
import {CreateCard} from "../pages/CreateCard";
import {EditCard} from "../pages/EditCard";

// Placeholder components for routes not yet implemented
const NotFound: React.FC = () => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Page Not Found</h1>
    <p className="text-gray-600 dark:text-gray-400">The page you're looking for doesn't exist.</p>
  </div>
);

const ComingSoon: React.FC<{feature: string}> = ({feature}) => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{feature}</h1>
    <p className="text-gray-600 dark:text-gray-400">This feature will be implemented in a future phase.</p>
  </div>
);

// Router configuration matching foundation document structure
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "groups/:groupId",
        element: <GroupDetail />,
      },
      {
        path: "groups/:groupId/cards/new",
        element: <CreateCard />,
      },
      {
        path: "groups/:groupId/cards/:cardId/edit",
        element: <EditCard />,
      },
      {
        path: "groups/:groupId/edit",
        element: <EditGroup />,
      },
      {
        path: "groups/new",
        element: <CreateGroup />,
      },
      {
        path: "study/:groupId",
        element: <StudySession />,
      },
      {
        path: "stats",
        element: <Stats />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "sync",
        element: <ComingSoon feature="Sync" />,
      },
      {
        path: "dev-test",
        element: <DevTest />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
