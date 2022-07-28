import { faker } from "@faker-js/faker";

function createVoucherData() {
  return {
    code: faker.random.alpha(8),
    discount: Math.floor(Math.random() * 20),
  };
}

const voucherFactory = { createVoucherData };
export default voucherFactory;
