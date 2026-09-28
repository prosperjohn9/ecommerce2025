package com.example.shop.security;

import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;

class LoginRateLimiterTest {

    private static final String EMAIL = "ada@example.com";
    private static final String IP = "203.0.113.7";

    private final TestClock clock = new TestClock(Instant.parse("2026-09-28T12:00:00Z"));
    private final LoginRateLimiter limiter = new LoginRateLimiter(clock);

    @Test
    void allowsFourFailuresAndBlocksAfterTheFifth() {
        failTimes(4, EMAIL, IP);
        assertThat(limiter.retryAfter(EMAIL, IP)).isEmpty();

        failTimes(1, EMAIL, IP);
        assertThat(limiter.retryAfter(EMAIL, IP)).contains(Duration.ofMinutes(15));
    }

    @Test
    void blockIsPerEmailNotPerSpelling() {
        failTimes(5, " ADA@Example.com ", IP);
        assertThat(limiter.retryAfter(EMAIL, "198.51.100.1")).isPresent();
    }

    @Test
    void retryAfterCountsDownFromTheFirstFailure() {
        failTimes(1, EMAIL, IP);
        clock.advance(Duration.ofMinutes(10));
        failTimes(4, EMAIL, IP);

        assertThat(limiter.retryAfter(EMAIL, IP)).contains(Duration.ofMinutes(5));
    }

    @Test
    void unblocksWhenTheWindowEnds() {
        failTimes(5, EMAIL, IP);
        clock.advance(Duration.ofMinutes(15));

        assertThat(limiter.retryAfter(EMAIL, IP)).isEmpty();
        failTimes(4, EMAIL, IP);
        assertThat(limiter.retryAfter(EMAIL, IP)).isEmpty();
    }

    @Test
    void successClearsTheEmailCount() {
        failTimes(4, EMAIL, IP);
        limiter.recordSuccess(EMAIL);
        failTimes(4, EMAIL, IP);

        assertThat(limiter.retryAfter(EMAIL, IP)).isEmpty();
    }

    @Test
    void blocksAnIpAfterTwentyFailuresAcrossEmails() {
        for (int i = 0; i < 19; i++) {
            limiter.recordFailure("user" + i + "@example.com", IP);
        }
        assertThat(limiter.retryAfter("someone-else@example.com", IP)).isEmpty();

        limiter.recordFailure("user19@example.com", IP);
        assertThat(limiter.retryAfter("someone-else@example.com", IP)).isPresent();
        assertThat(limiter.retryAfter("someone-else@example.com", "198.51.100.1")).isEmpty();
    }

    @Test
    void successDoesNotClearTheIpCount() {
        for (int i = 0; i < 20; i++) {
            limiter.recordFailure("user" + i + "@example.com", IP);
            limiter.recordSuccess("user" + i + "@example.com");
        }
        assertThat(limiter.retryAfter("attacker@example.com", IP)).isPresent();
    }

    private void failTimes(int times, String email, String ip) {
        for (int i = 0; i < times; i++) {
            limiter.recordFailure(email, ip);
        }
    }

    private static final class TestClock extends Clock {
        private Instant now;

        TestClock(Instant now) {
            this.now = now;
        }

        void advance(Duration duration) {
            now = now.plus(duration);
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return now;
        }
    }
}
