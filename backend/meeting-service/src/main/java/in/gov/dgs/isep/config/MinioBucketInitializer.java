package in.gov.dgs.isep.config;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class MinioBucketInitializer {

    private static final Logger log = LoggerFactory.getLogger(MinioBucketInitializer.class);

    private final MinioClient minioClient;

    @Value("${minio.bucket}")
    private String bucket;

    public MinioBucketInitializer(MinioClient minioClient) {
        this.minioClient = minioClient;
    }

    @PostConstruct
    public void ensureBucket() {
        try {
            boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
                log.info("MinIO bucket created: {}", bucket);
            }
        } catch (Exception e) {
            log.warn("MinIO bucket check failed (service may start without storage): {}", e.getMessage());
        }
    }
}
