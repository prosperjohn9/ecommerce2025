package com.example.shop.dto;

import com.example.shop.model.ShippingAddress;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ShippingDetails(
        @NotBlank @Size(max = 100) String fullName,
        @NotBlank @Size(max = 30) String phone,
        @NotBlank @Size(max = 200) String address,
        @NotBlank @Size(max = 100) String city,
        @NotBlank @Size(max = 100) String country) {

    public ShippingAddress toAddress() {
        return new ShippingAddress(fullName.strip(), phone.strip(), address.strip(), city.strip(), country.strip());
    }

    public static ShippingDetails from(ShippingAddress address) {
        return new ShippingDetails(address.getFullName(), address.getPhone(), address.getAddress(),
                address.getCity(), address.getCountry());
    }
}
