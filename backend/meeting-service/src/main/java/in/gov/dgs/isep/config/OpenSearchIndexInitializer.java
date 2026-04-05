package in.gov.dgs.isep.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.opensearch.indices.CreateIndexRequest;
import org.opensearch.client.opensearch.indices.ExistsRequest;
import org.springframework.stereotype.Component;

@Component
public class OpenSearchIndexInitializer {

    private static final Logger log = LoggerFactory.getLogger(OpenSearchIndexInitializer.class);

    private final OpenSearchClient openSearchClient;

    public OpenSearchIndexInitializer(OpenSearchClient openSearchClient) {
        this.openSearchClient = openSearchClient;
    }

    @PostConstruct
    public void initIndexes() {
        createIfAbsent("documents_index");
        createIfAbsent("feedback_index");
        createIfAbsent("audit_logs_index");
    }

    private void createIfAbsent(String index) {
        try {
            boolean exists = openSearchClient.indices()
                    .exists(ExistsRequest.of(r -> r.index(index)))
                    .value();
            if (!exists) {
                openSearchClient.indices().create(CreateIndexRequest.of(r -> r.index(index)));
                log.info("OpenSearch index created: {}", index);
            } else {
                log.debug("OpenSearch index already exists: {}", index);
            }
        } catch (Exception e) {
            log.error("Failed to initialise OpenSearch index '{}': {}", index, e.getMessage());
        }
    }
}
