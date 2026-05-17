import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

export const handlers: ReturnType<typeof http.get>[] = []
export const server = setupServer(...handlers)
