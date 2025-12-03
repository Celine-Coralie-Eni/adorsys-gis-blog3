---
title: Authorization Code Flow
slug: authorization-code-flow
authors: Tissong Ghislain & Nafisatou
tags: [oauth2, security]
lang: en
domain: Identity & Access Management
---

![oauth](https://miro.medium.com/v2/resize:fit:1200/1*F5Rm3iDuJpIvmyMJ_Np8bg.jpeg)

---

# The Standard Web Flow (Authorization Code Flow)

## Introduction
The **Authorization Code Flow** (Standard Web Flow) is a core OAuth 2.0 mechanism.  
It is widely used by **web applications with a backend server** that can securely store client secrets.  
This flow provides a safe method to obtain **access tokens** and **refresh tokens**, which allow the application to act on behalf of the user when accessing protected resources.

---

## Definition
The **Authorization Code Flow** is an OAuth 2.0 authorization method where an application:
1. Redirects the user to an **Authorization Server** for login and consent.
2. Receives an **authorization code**.
3. Exchanges the code for an **access token** (and optionally a refresh token).

This ensures that sensitive tokens are never directly exposed to the browser.

---

## Key Terms
- **OAuth 2.0** – Open standard for secure delegated access.  
- **Client (App)** – The application requesting access on behalf of a user.  
- **Authorization Server** – Issues authorization codes and tokens.  
- **Resource Server** – Hosts APIs and protected resources.  
- **Authorization Code** – Temporary credential exchanged for an access token.  
- **Access Token** – Grants access to APIs/resources.  
- **Refresh Token** – Used to obtain new access tokens without re-authenticating.

---

## Flow Steps
1. **Login Request** – User initiates login on the client app.  
2. **Redirect to Authorization Server** – User authenticates with credentials.  
3. **Authorization Code Issued** – Server sends a temporary code back to the client app.  
4. **Token Request** – The client app exchanges the code with the Authorization Server.  
5. **Access Token Issued** – The server returns an **access token** (and optionally a refresh token).  
6. **Resource Access** – The client uses the token to request resources from the Resource Server.

---



---

## Advantages
- High Security
- Supports Confidential Clients
- Refresh Token Support

---

## Disadvantages
- More Complex Implementation
- Slower Initial Authentication
- More Infrastructure Overhead

---

## Real-world Example
Example: A web dashboard wants to read user emails from Gmail.  
- The user logs in through Google’s Authorization Server.  
- The dashboard app gets an **authorization code**.  
- The app exchanges the code for an **access token**.  
- The dashboard can now fetch the user’s Gmail data via Google APIs.  

---

## Conclusion
The **Authorization Code Flow** is the **most secure and recommended** OAuth 2.0 flow for web applications with backends.  
It protects tokens from exposure, supports refresh tokens, and provides strong trust between users and applications.

---

### Group Members
- Tissong Ghislain
- Nafisatou

