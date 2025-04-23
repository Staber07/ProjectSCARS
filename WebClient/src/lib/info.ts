export const Program = {
  name: "Project SCARS",
  description: "School Canteen Automated Reporting System",
  version: "0.3.0",
};

export const Connections = {
  CentralServer: {
    endpoint: "http://localhost:8081",
  },
  LocalServer: {
    endpoint: "http://localhost:8082",
  },
};

export const LocalStorage = {
  jwt_name: "at",
  jwt_type: "tt",
};
