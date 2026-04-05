package in.gov.dgs.isep.shared.util;

/**
 * Derives coarse device class from User-Agent for audit logging (RFP 3.16H).
 */
public final class DeviceTypeUtil {
    private DeviceTypeUtil() {}

    public static String detect(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) return "UNKNOWN";
        String ua = userAgent.toLowerCase();
        if (ua.contains("mobile") || ua.contains("android") || ua.contains("iphone")
            || ua.contains("blackberry") || ua.contains("windows phone")) return "MOBILE";
        if (ua.contains("tablet") || ua.contains("ipad")) return "TABLET";
        return "DESKTOP";
    }
}
