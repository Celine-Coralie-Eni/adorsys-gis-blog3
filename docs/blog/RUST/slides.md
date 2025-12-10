---
title: Rust Programming Language
slug: rust
tags: [systems, performance, safety]
lang: en

---

![Rust](https://www.rust-lang.org/static/images/rust-logo-blk.svg)

---

Rust is a modern **systems programming language** focused on performance, reliability, and memory safety — without needing a garbage collector.

---

## Why Rust?

1. **Memory Safety** (ownership system)
2. **High Performance** (as fast as C/C++)
3. **Concurrency Without Fear**
4. **Great Tooling** (`cargo`, `rustup`)
5. **Growing Ecosystem** (Web, CLI, Embedded)

---

## Core Concepts

* **Ownership** – Every value has a single owner.
* **Borrowing** – References without transferring ownership.
* **Lifetimes** – Ensure references stay valid.
* **Pattern Matching** – With `match` keyword.
* **Traits** – Define shared behavior.

---

## Hello World

```rust
fn main() {
    println!("Hello, world!");
}
```

---

## Variables

* Immutable by default: `let x = 5;`
* Mutable: `let mut y = 10;`
* Constants: `const PI: f64 = 3.14;`

---

## Functions

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

---

## Control Flow

```rust
let num = 7;
if num % 2 == 0 {
    println!("Even");
} else {
    println!("Odd");
}
```

---

## Ownership Example

```rust
fn main() {
    let s = String::from("Rust");
    takes_ownership(s); // moved
}

fn takes_ownership(s: String) {
    println!("{}", s);
}
```

---

## Error Handling

* **Recoverable**: `Result<T, E>`
* **Unrecoverable**: `panic!()`

---

## Cargo (Build Tool)

* `cargo new project` – create project
* `cargo build` – compile
* `cargo run` – build + run
* `cargo test` – run tests

---

## Ecosystem

* **Web**: Actix, Rocket
* **CLI**: Clap, Tui
* **Embedded**: no\_std support
* **WASM**: Rust → WebAssembly

---

## Best Practices

* Prefer **immutability**.
* Use `match` exhaustively.
* Write tests with `#[test]`.
* Use Clippy for linting.
* Document with `cargo doc`.

---

## Conclusion

Rust is a **safe, fast, and modern systems language** that combines low-level control with high-level productivity — perfect for the future of software.

---
