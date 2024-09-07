import { ReactNode } from "react"
import { Components } from "../pages/Components"
import { ConnectPage } from "../pages/ConnectPage"
import { ComponentsTest } from "../pages/ComponentsTest"

type Routes = {
  name: string
  path: string
  default?: boolean
  element: ReactNode
}[]

type RouteCategories = ((RouteCategoryPath | RouteCategoryMulti) & {
  name?: string
})[]

interface RouteCategoryPath {
  path: string
}

export interface RouteCategoryMulti {
  paths: {
    heading?: string
    paths: string[]
  }[]
}

const pages = [
  {
    path: "components",
    name: "Components",
    element: <Components />,
    default: true,
  },
  {
    path: "componentsTest",
    name: "componentsTest",
    element: <ComponentsTest />,
    default: true,
  },
  {
    path: "connect",
    name: "Connect",
    element: <ConnectPage />,
    default: true,
  },
]

export const routes: Routes = [
  {
    path: "/",
    name: "Components",
    element: <Components />,
  },
  ...pages,
]

export const routeCategories: RouteCategories = [
  {
    name: "Navigation",
    paths: [
      {
        paths: ["components", "componentsTest", "connect"],
      },
    ],
  },
]

export const nameFromRoute = (path: string): string | undefined =>
  routes?.find((r) => r.path === path)?.name

export const isDefaultRoute = (path: string): boolean =>
  !!routes?.find((r) => r.default === true && r.path === path)
