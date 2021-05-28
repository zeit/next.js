// Identify /[param]/ in route string
const TEST_ROUTE = /\/\[[^/]+?\](?:\.image)?(?=\/|$)/

export function isDynamicRoute(route: string): boolean {
  return TEST_ROUTE.test(route)
}
