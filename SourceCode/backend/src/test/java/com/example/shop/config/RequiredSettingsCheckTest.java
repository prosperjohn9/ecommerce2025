package com.example.shop.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import static org.assertj.core.api.Assertions.assertThat;

class RequiredSettingsCheckTest {

    private final ApplicationContextRunner runner = new ApplicationContextRunner()
            .withUserConfiguration(RequiredSettingsCheck.class);

    @Test
    void startsWhenAllDatabaseSettingsResolve() {
        runner.withPropertyValues(
                        "spring.datasource.url=jdbc:postgresql://localhost:5432/test",
                        "spring.datasource.username=user",
                        "spring.datasource.password=secret")
                .run(context -> assertThat(context).hasNotFailed());
    }

    @Test
    void failsWithClearMessageWhenAVariableIsMissing() {
        runner.withPropertyValues(
                        "spring.datasource.url=jdbc:postgresql://localhost:5432/test",
                        "spring.datasource.username=user",
                        "spring.datasource.password=${SHOP_TEST_UNSET_VARIABLE}")
                .run(context -> assertThat(context)
                        .hasFailed()
                        .getFailure()
                        .rootCause()
                        .hasMessageContaining("SHOP_TEST_UNSET_VARIABLE"));
    }

    @Test
    void failsWhenASettingIsAbsent() {
        runner.withPropertyValues(
                        "spring.datasource.url=jdbc:postgresql://localhost:5432/test",
                        "spring.datasource.username=user")
                .run(context -> assertThat(context)
                        .hasFailed()
                        .getFailure()
                        .hasMessageContaining("spring.datasource.password"));
    }
}
