export const testUserData = {
  valid: {
    name: "Test User",
    email: "test@example.com",
    password: "password123"
  },
  admin: {
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123"
  },
  invalidEmail: {
    name: "Test User",
    email: "invalid-email",
    password: "password123"
  },
  missingName: {
    email: "test@example.com",
    password: "password123"
  },
  shortPassword: {
    name: "Test User",
    email: "test@example.com",
    password: "123"
  }
};

export const testHomeData = {
  valid: {
    name: "Test Home",
    numberOfAdults: 2,
    numberOfChildren: 1,
    numberOfPets: 0
  },
  minimal: {
    name: "Minimal Home"
  },
  invalid: {
    name: "",
    numberOfAdults: -1
  }
};

export const testInventoryData = {
  valid: {
    name: "Test Item",
    quantity: 5,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  },
  expiring: {
    name: "Expiring Item",
    quantity: 1,
    expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
  },
  expired: {
    name: "Expired Item",
    quantity: 1,
    expirationDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
  }
};

export const testRecommendedItemData = {
  valid: {
    name: "Recommended Item",
    description: "A useful item to have",
    expiresIn: 30,
    quantity: 2,
    isOptional: false
  },
  optional: {
    name: "Optional Item",
    description: "Nice to have but not essential",
    expiresIn: 60,
    quantity: 1,
    isOptional: true
  }
};
