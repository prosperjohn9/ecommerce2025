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

    private static final List<String> REQUIRED = List.of(
            "spring.datasource.url",
            "spring.datasource.username",
            "spring.datasource.password");

    private Environment environment;

    @Override
    public void setEnvironment(Environment environment) {
        this.environment = environment;
    }

    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {
        for (String key : REQUIRED) {
            try {
                environment.getRequiredProperty(key);
            } catch (IllegalArgumentException | IllegalStateException e) {
                throw new IllegalStateException("Missing required setting " + key + ". "
                        + "Set DB_URL, DB_USERNAME and DB_PASSWORD as environment variables "
                        + "or in SourceCode/backend/.env (see .env.example).", e);
            }
        }
    }
}
