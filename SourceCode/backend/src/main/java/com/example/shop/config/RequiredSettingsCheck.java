package com.example.shop.config;

import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.context.EnvironmentAware;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Stops startup with a clear message when a required setting is missing.
 * Without this, Spring Boot keeps an unresolved "${DB_PASSWORD}" as literal text
 * and fails later with a misleading JDBC or login error.
 * Runs as a BeanFactoryPostProcessor so it fires before the DataSource is created.
 */
@Component
public class RequiredSettingsCheck implements BeanFactoryPostProcessor, EnvironmentAware {

    private record Setting(String property, String envVar) {
    }

    private static final List<Setting> REQUIRED = List.of(
            new Setting("spring.datasource.url", "DB_URL"),
            new Setting("spring.datasource.username", "DB_USERNAME"),
            new Setting("spring.datasource.password", "DB_PASSWORD"),
            new Setting("app.cors.allowed-origins", "FRONTEND_ORIGIN"));

    private Environment environment;

    @Override
    public void setEnvironment(Environment environment) {
        this.environment = environment;
    }

    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {
        for (Setting setting : REQUIRED) {
            try {
                environment.getRequiredProperty(setting.property());
            } catch (IllegalArgumentException | IllegalStateException e) {
                throw new IllegalStateException("Missing required setting " + setting.property()
                        + " (environment variable " + setting.envVar() + "). "
                        + "Set it as an environment variable or in SourceCode/backend/.env (see .env.example).", e);
            }
        }
    }
}
