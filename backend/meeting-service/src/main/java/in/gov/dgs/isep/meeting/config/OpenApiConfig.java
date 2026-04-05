package in.gov.dgs.isep.meeting.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI isepOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("ISEP — IMO Strategic Engagement Platform API")
                        .description("Internal API for DGS IMO engagement workflows")
                        .version("v1.0")
                        .contact(new Contact()
                                .name("DGS IC Division")
                                .email("ic@dgs.gov.in")));
    }
}
