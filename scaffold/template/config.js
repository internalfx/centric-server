
// Development Config
export const development = {
  baseURL: 'http://localhost:8000',
  arango: {
    url: 'http://localhost:8529',
    database: 'centric_dev'
  },
  services: [
    'example'
  ]
}

// Production Config
export const production = {
  baseURL: 'http://localhost:8000',
  services: [
  ]
}
