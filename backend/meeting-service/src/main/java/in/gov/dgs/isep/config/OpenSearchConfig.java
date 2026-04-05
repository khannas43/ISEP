package in.gov.dgs.isep.config;

import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.opensearch.client.RestClient;
import org.opensearch.client.json.jackson.JacksonJsonpMapper;
import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.transport.rest_client.RestClientTransport;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenSearchConfig {

    @Value("${opensearch.host}")
    private String host;
    @Value("${opensearch.port}")
    private int port;
    @Value("${opensearch.username}")
    private String username;
    @Value("${opensearch.password}")
    private String password;

    @Bean
    public OpenSearchClient openSearchClient() {
        final BasicCredentialsProvider credProvider = new BasicCredentialsProvider();
        credProvider.setCredentials(
                AuthScope.ANY,
                new UsernamePasswordCredentials(username, password));

        RestClient restClient = RestClient.builder(new HttpHost(host, port, "http"))
                .setHttpClientConfigCallback(b -> b.setDefaultCredentialsProvider(credProvider))
                .build();

        return new OpenSearchClient(new RestClientTransport(restClient, new JacksonJsonpMapper()));
    }
}
