---
title: Groups are about symmetry, not sets
description: The definition of a group is a list of axioms, but the reason to care is that groups capture the way symmetries compose.
date: 2026-11-20
stage: star
topics: [groups, symmetry]
---

The textbook definition of a group (a set with an associative operation, an identity and
inverses) hides why anyone invented it. A group is what you get when you ask *"which
transformations leave this thing alone?"* and notice that the answers can be combined and undone.

Rotations of a square, permutations of identical particles, Lorentz transformations: in each case
the axioms aren't arbitrary. They're exactly the properties that "doing one symmetry and then
another" always has:

- Doing nothing is a symmetry (the identity).
- Every symmetry can be undone (inverses).
- Combining symmetries doesn't depend on how you bracket them (associativity).

The worked-out version, with examples and Lagrange's theorem, is in
[[notes:algebra/what-is-a-group]]. The symmetry that matters most for spin is in
[[spin-half-and-the-double-cover]].
