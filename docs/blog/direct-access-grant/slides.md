---
title: Direct Access Grant Demo
slug: direct-access-grant-slides
lang: en
authors: Nathan
tags: [oauth2, authentication, keycloak, presentation]
description: Slide presentation demonstrating Direct Access Grant (Resource Owner Password Credentials) flow implementation.
date: '2025-09-16'
---

# Direct Access Grant Flow
## (Resource Owner Password Credentials)

---

## What is Direct Access Grant?

It is an OAuth 2.0 grant type where a trusted client application can obtain an access token by directly exchanging a user's username and password with an authorization server.


---

## Step 1: Credential Collection

- User opens trusted application
- User enters username and password
- Complete trust required

---

## Step 2: Authentication Request

- Client collects user credentials
- Client adds own identification
- Client sends to Authorization Server
- Both credentials validated

---

## Step 3: Token Issuance

- Server verifies client identity
- Server authenticates user
- Server generates tokens
- Client receives access tokens

---

## Step 4: Resource Access

- Client uses token in headers
- Client requests protected data
- Server validates token
- User sees their data

---

## Advantages

- Simple implementation with fewer steps
- No browser required
- Direct user experience
- Legacy system friendly

---

## Disadvantages

- Security risk - client handles passwords
- Limited trust model
- No consent screen
- Credential exposure

---

## Security Risks

- Credentials exposed to client
- No permission consent
- Potential credential theft
- Difficult access auditing

---

## Security Mitigations

**Essential Mitigations** = Critical security measures to reduce risks

- Use only with trusted first-party clients
- Implement HTTPS everywhere
- Configure short token lifetimes
- Enable strong client authentication
- Conduct regular security audits