package com.example.shop.security;

import com.example.shop.model.UserAccount;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Counts failed sign-ins per email and per client IP in a fixed 15-minute window.
 * - 5 failures for one email, or 20 from one IP, block further attempts until the window ends.
 * - Unknown emails are counted exactly like real ones, so a block reveals nothing.
 * - A correct password clears that email's count. The IP count stays, so signing in to
 *   one's own account cannot reset it.
 * Counts live in memory: they reset on restart and are not shared between instances.
 */
@Component
public class LoginRateLimiter {

    static final int MAX_FAILURES_PER_EMAIL = 5;
    static final int MAX_FAILURES_PER_IP = 20;
    static final Duration WINDOW = Duration.ofMinutes(15);

    // Past this many tracked keys, expired entries are dropped so memory stays bounded.
    private static final int PRUNE_THRESHOLD = 10_000;

    private final Clock clock;
    private final Map<String, Window> failures = new ConcurrentHashMap<>();

    public LoginRateLimiter() {
        this(Clock.systemUTC());
    }

    LoginRateLimiter(Clock clock) {
        this.clock = clock;
    }

    /** How long this email and IP must wait before trying again, or empty if they may try now. */
    public Optional<Duration> retryAfter(String email, String ip) {
        Instant now = clock.instant();
        Optional<Duration> byEmail = blockedFor(emailKey(email), MAX_FAILURES_PER_EMAIL, now);
        Optional<Duration> byIp = blockedFor(ipKey(ip), MAX_FAILURES_PER_IP, now);
        if (byEmail.isPresent() && byIp.isPresent()) {
            return Optional.of(byEmail.get().compareTo(byIp.get()) >= 0 ? byEmail.get() : byIp.get());
        }
        return byEmail.isPresent() ? byEmail : byIp;
    }

    public void recordFailure(String email, String ip) {
        Instant now = clock.instant();
        increment(emailKey(email), now);
        increment(ipKey(ip), now);
        if (failures.size() > PRUNE_THRESHOLD) {
            failures.values().removeIf(window -> window.expired(now));
        }
    }

    public void recordSuccess(String email) {
        failures.remove(emailKey(email));
    }

    private Optional<Duration> blockedFor(String key, int limit, Instant now) {
        Window window = failures.get(key);
        if (window == null || window.expired(now) || window.count() < limit) {
            return Optional.empty();
        }
        return Optional.of(Duration.between(now, window.end()));
    }

    private void increment(String key, Instant now) {
        failures.compute(key, (k, window) -> window == null || window.expired(now)
                ? new Window(now, 1)
                : new Window(window.start(), window.count() + 1));
    }

    private static String emailKey(String email) {
        return "email:" + UserAccount.normalizeEmail(email);
    }

    private static String ipKey(String ip) {
        return "ip:" + ip;
    }

    private record Window(Instant start, int count) {

        Instant end() {
            return start.plus(WINDOW);
        }

        boolean expired(Instant now) {
            return !now.isBefore(end());
        }
    }
}
