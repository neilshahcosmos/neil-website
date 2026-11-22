---
title: Spin-½ is a fact about topology
description: Why an electron needs a 720° turn to come back to itself, in one homomorphism.
date: 2026-11-20
stage: nebula
topics: [lie groups, symmetry, quantum mechanics]
---

The statement that a spin-½ state picks up a minus sign under a $2\pi$ rotation sounds like
a strange physical fact. It's really a statement about the group of rotations.

There is a smooth homomorphism
$$
\Phi : \mathrm{SU}(2) \longrightarrow \mathrm{SO}(3), \qquad \ker \Phi = \{\pm I\},
$$
which is surjective and exactly two-to-one. Quantum states are only defined up to a phase, so a
rotation only has to act on them up to a phase too. Those "up to a phase" (projective)
representations of $\mathrm{SO}(3)$ turn out to be exactly the ordinary representations of
$\mathrm{SU}(2)$. A full turn in $\mathrm{SO}(3)$ lifts to a path in $\mathrm{SU}(2)$ that ends
at $-I$, not $I$, and that is the minus sign.

The construction and the proof that $\Phi$ is two-to-one are in
[[notes:lie-theory/su2-covers-so3]]. Where this goes next, towards what a particle *is*,
is [[what-is-a-particle]], which hasn't been written yet.
