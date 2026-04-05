# Fix "mapping key image already defined" on the server

The error means YAML sees two `image:` keys in the same service. Usually **`kong:`** is indented with 4 spaces instead of 2, so it becomes a key under **keycloak** and both have `image:`.

## On the server, run:

```bash
cd /root/DG-Shipping
sed -n '41,78p' infrastructure/docker/docker-compose.prod.yml | cat -A
```

That shows spaces/tabs. **`kong:`** must start with **exactly 2 spaces** (same as `keycloak:`), not 4.

## Fix: replace keycloak + kong block

Edit the file:

```bash
nano infrastructure/docker/docker-compose.prod.yml
```

Find the **keycloak:** block and the **kong:** block. Ensure:

- The line **`kong:`** has exactly **2 spaces** at the start (same as `postgresql:`, `keycloak:`, `meeting-service:`).
- Under **kong:**, the keys `image`, `environment`, `volumes`, `tmpfs`, `depends_on`, `restart` each have **4 spaces** at the start.

Or copy the **keycloak** and **kong** sections from the repo again (lines 42–77) and paste over the same section on the server, then save.

## Quick sed fix (if kong has 4 spaces)

If you see `....kong:` (4 spaces) in the cat -A output, fix it:

```bash
cd /root/DG-Shipping
sed -i 's/^    kong:$/  kong:/' infrastructure/docker/docker-compose.prod.yml
```

Then run:

```bash
COMPOSE="docker compose -f infrastructure/docker/docker-compose.prod.yml --env-file infrastructure/docker/.env.production"
$COMPOSE config > /dev/null && echo "YAML OK" || echo "YAML still invalid"
```

If "YAML OK", then:

```bash
$COMPOSE up -d kong
```
