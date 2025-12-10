---
title: Authorization Code Flow
slug: authorization-code-flow
lang: en
---

![oauth](https://miro.medium.com/v2/resize:fit:1200/1*F5Rm3iDuJpIvmyMJ_Np8bg.jpeg)

---

# The Standard Web Flow (Authorization Code Flow)

---

## Introduction
It is part of **OAuth 2.0** mechanism, used by **web apps with a backend** and ensures **secure token handling**  

---

## Definition
### OAuth 2.0 flow using:  
**Authorization Code** → exchanged for **Access Token**  with Tokens never exposed to browser  

---

## Keywords
OAuth 2.0 - Authorization Server - Resource Server - Client App - Authorization Code - Access Token - Refresh Token  

---

## Flow Steps
###### User logs in via Client App  
###### Redirected to Authorization Server  
###### Server returns **Authorization Code**  
###### Client exchanges code for **Access Token**  
###### Client uses token to call APIs  

---

![alt text](https://docs.secureauth.com/ciam/en/image/uuid-d6c01adc-d9e9-6fcf-48cc-2da67d1e40e4.svg)

---

## Advantages
###### Tokens never exposed to browser
###### Supports refresh tokens
###### High security for web apps
###### Widely adopted industry standard

---

## Real-world Example
###### Logging into Google with a third-party app
###### App redirects you to Google for login
###### You grant access, app receives code, exchanges for token

---

## Conclusion
The **Authorization Code Flow** is the **most secure and recommended** OAuth 2.0 flow for web applications with backends.  
