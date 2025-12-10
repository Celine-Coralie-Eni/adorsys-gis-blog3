---
title: CDNs
slug: cdn
tags: [network]
---

![what is cdn](https://www.shutterstock.com/image-vector/cdn-content-delivery-network-information-260nw-2250320215.jpg)
---

A Content Delivery Network (CDN) is a geographically distributed group of servers that caches content close to end users. This allows for quick transfer of assets needed for loading Internet content, such as HTML pages, JavaScript files, stylesheets, images, and videos.

---

## Is a CDN the Same as Web Hosting?

No. A CDN does not host content and cannot replace proper web hosting. Instead, it caches content at the network edge to improve performance.

---

## Benefits of Using a CDN

1. **Improving Website Load Times**
2. **Reducing Bandwidth Costs**
3. **Increasing Content Availability and Redundancy**
4. **Improving Website Security**

---

## How a CDN Works

A CDN is a network of servers linked to deliver content quickly, cheaply, reliably, and securely.

### Key Mechanisms

- Server Placement and Optimizations
- Latency Reduction
- Reliability and Redundancy
- Bandwidth Cost Reduction
- Security

---

## CDN Request Flow

1. DNS resolves to the CDN.
2. Nearest edge server checks cache.
3. Cache hit: Deliver immediately.
4. Cache miss: Fetch from origin, cache, and deliver.

---

## Representation of a Globally Distributed CDN Network

---

```mermaid
graph TD
    A[User in USA] --> B[CDN Server USA]
    C[User in Europe] --> D[CDN Server Europe]
    E[User in Asia] --> F[CDN Server Asia]
    B --> G[IXP Hub]
    D --> G
    F --> G
    G --> H[Origin Server]
    style B fill:#f9f,stroke:#333
    style D fill:#f9f,stroke:#333
    style F fill:#f9f,stroke:#333
    style H fill:#ff9,stroke:#333
```

---

## CDN Load Balancer Representation

![public/images/load-balancing.jpg](https://www.cloudflare.com/img/learning/cdn/reliability/load-balance-diagram.png)

---

## CDN Failover Representation

![public/images/failover.png](https://imagekit.io/blog/content/images/2020/06/Happy-User.jpg)

---

## Anycast Network Representation

```mermaid
graph TD
    A[User] --> B[Anycast IP]
    B --> C[Router]
    C --> D[Data Center 1 Closest/Online]
    C -->|If D Fails| E[Data Center 2]
    C -->|Alternative| F[Data Center 3]
    style B fill:#9ff,stroke:#333
    style C fill:#ff9,stroke:#333
    style D fill:#f9f,stroke:#333
    style E fill:#f9f,stroke:#333
    style F fill:#f9f,stroke:#333
```

---

## Special Scenarios: User Closer to Origin Server Than CDN Server

If a user is geographically closer to the origin server than any CDN server, the request flow typically still involves the CDN due to DNS configuration.

---

## Relationship Between CDNs and Next.js

Next.js integrates seamlessly with CDNs for enhanced performance.

### Key Aspects of the Relationship

- Static Asset Delivery
- Vercel Integration
- Image Optimization
- Caching Strategies
- Custom Configurations

---

## Next.js and CDN Integration

```mermaid
graph TD
    A[User] -->|Request via DNS| B[CDN Edge Server]
    B -->|Cache Hit: Static Assets/SSG/ISR| C[Content Delivered]
    B -->|Cache Miss: Dynamic or Uncached| D[Next.js Origin Server]
    D -->|SSR, ISR, or Fetch Static| B
    B --> C
    style A fill:#9f9,stroke:#333
    style B fill:#f9f,stroke:#333
    style C fill:#ff9,stroke:#333
    style D fill:#f99,stroke:#333
```

---

## Conclusion

CDNs are essential for modern web performance, offering speed, cost savings, reliability, and security.
