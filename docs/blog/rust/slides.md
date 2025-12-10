---

title: Rust
slug: rust
tags: [systems, performance, safety]
lang: fr

---

![Rust](https://www.rust-lang.org/static/images/rust-logo-blk.svg)

---

## Introduction à Rust

Rust est un langage de programmation **système** moderne, conçu pour être **rapide**, **sûr en mémoire**, et **concurrent** sans crainte des erreurs classiques comme les segfaults.

---

## Pourquoi Rust ?

1. **Sécurité mémoire** sans ramasse-miettes (GC)
2. **Performances comparables au C/C++**
3. **Concurrence sûre** grâce à l’ownership
4. **Écosystème en croissance** (web, CLI, embarqué, WASM)
5. **Outils puissants** : `cargo`, `rustup`, `clippy`

---

## Principes Clés

* **Ownership et Borrowing** – contrôle de la mémoire par le compilateur
* **Lifetimes** – validité des références garantie
* **Pattern Matching** – via `match` et `if let`
* **Traits** – comportements réutilisables

---

## Exemple Simple

```rust
fn main() {
    println!("Bonjour Rust !");
}
```

---

## Variables

* Immuables par défaut : `let x = 5;`
* Mutables : `let mut y = 10;`
* Constantes : `const PI: f64 = 3.14;`

---

## Fonctions

```rust
fn addition(a: i32, b: i32) -> i32 {
    a + b
}
```

---

## Gestion des Erreurs

* **Récupérables** : `Result<T, E>`
* **Non récupérables** : `panic!()`

---

## Cargo – L’outil de Rust

* `cargo new projet` – créer un projet
* `cargo build` – compiler
* `cargo run` – exécuter
* `cargo test` – lancer les tests

---

## Écosystème

* **Web** : Actix, Rocket
* **CLI** : Clap, Tui
* **Embarqué** : support `no_std`
* **WASM** : Rust → WebAssembly

---

## Conclusion

Rust combine **performance**, **sécurité** et **expressivité**, faisant de lui un langage incontournable pour le futur du développement logiciel.

---
