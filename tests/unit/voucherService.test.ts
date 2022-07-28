import { faker } from "@faker-js/faker";
import { jest } from "@jest/globals";

import voucherRepository from "../../src/repositories/voucherRepository";
import voucherService from "../../src/services/voucherService";
import voucherFactory from "../factories/voucherFactory";

describe("voucherService test suite", () => {
  it("should be always very positive", () => {
    expect("didi").toBe("didi");
  });

  it("given code and discount, create voucher", async () => {
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return 0;
      });
    jest
      .spyOn(voucherRepository, "createVoucher")
      .mockImplementationOnce((): any => {
        return 0;
      });
    const voucher = voucherFactory.createVoucherData();

    await voucherService.createVoucher(voucher.code, voucher.discount);

    expect(voucherRepository.createVoucher).toBeCalled();
  });

  it("given repeated code and discount, don't create voucher", async () => {
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return "voucher";
      });

    const response = voucherService.createVoucher(
      faker.random.alpha(8),
      Math.floor(Math.random() * 20)
    );

    expect(response).rejects.toEqual({
      type: "conflict",
      message: "Voucher already exist.",
    });
  });

  it("given voucher apply discount", async () => {
    const voucher = voucherFactory.createVoucherData();
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return { ...voucher, used: false };
      });
    jest
      .spyOn(voucherRepository, "useVoucher")
      .mockImplementationOnce((): any => {
        return true;
      });

    const amount = 1000;

    const response = await voucherService.applyVoucher(voucher.code, amount);
    expect(response.amount).toBe(amount);
    expect(response.discount).toBe(voucher.discount);
    expect(response.finalAmount).toBe(
      amount - amount * (voucher.discount / 100)
    );
    expect(response.applied).toBe(true);
  });

  it("given voucher to an amount less than 100 don't apply discount", async () => {
    const voucher = voucherFactory.createVoucherData();
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return { ...voucher, used: false };
      });
    jest
      .spyOn(voucherRepository, "useVoucher")
      .mockImplementationOnce((): any => {
        return true;
      });

    const amount = 99;

    const response = await voucherService.applyVoucher(voucher.code, amount);
    expect(response.amount).toBe(amount);
    expect(response.discount).toBe(voucher.discount);
    expect(response.finalAmount).toBe(amount);
    expect(response.applied).toBe(false);
  });

  it("given wrong voucher don't apply discount", async () => {
    const voucher = voucherFactory.createVoucherData();
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return 0;
      });
    jest
      .spyOn(voucherRepository, "useVoucher")
      .mockImplementationOnce((): any => {
        return true;
      });

    const amount = 1000;

    const response = voucherService.applyVoucher(voucher.code, amount);
    expect(response).rejects.toEqual({
      type: "conflict",
      message: "Voucher does not exist.",
    });
  });

  it("given used voucher don't apply discount", async () => {
    const voucher = voucherFactory.createVoucherData();
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return { ...voucher, used: true };
      });
    jest
      .spyOn(voucherRepository, "useVoucher")
      .mockImplementationOnce((): any => {
        return true;
      });
    const amount = 1000;

    const response = await voucherService.applyVoucher(voucher.code, amount);
    expect(response.amount).toBe(amount);
    expect(response.discount).toBe(voucher.discount);
    expect(response.finalAmount).toBe(amount);
    expect(response.applied).toBe(false);
  });
});
