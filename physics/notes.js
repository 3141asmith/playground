(()=>{
 'use strict';
 // Adapted teaching material from the supplied A_Level_Physics_Notes.docx,
 // whose lesson sheets credit N. Dwyer. Equations and explanations are rewritten;
 // the document's historical unit numbers are retained only as a navigation aid.
 const S=(title,paragraphs,equation,table)=>({title,paragraphs,equation,table});
 const E=(prompt,steps)=>({prompt,steps}),R=(prompt,answer)=>({prompt,answer});
 const notes={
 particles:{sections:[
  S('Atoms, isotopes and specific charge',[
   'An atom contains a small nucleus of protons and neutrons, surrounded by electrons in quantum states. The proton number Z identifies the element; nucleon number A counts protons plus neutrons, so N = A − Z. Isotopes share Z but have different N. Relative atomic mass is an abundance-weighted average, not the nucleon number of a single atom.',
   'Removing electrons produces a positive ion; adding electrons produces a negative ion. Specific charge is signed charge divided by mass. For a nucleus use approximately A times the nucleon mass; for an ion, use its net charge rather than the charge of every proton.'],
   'specific charge = Q/m; Qion = (Z − number of electrons)e'),
  S('Quarks, hadrons and leptons',[
   'Hadrons experience the strong interaction and contain quarks. A baryon contains three quarks; an antibaryon contains three antiquarks. A meson contains a quark and an antiquark. Protons are uud and neutrons udd. Charged pions are u d̄ and d ū; K⁺ is u s̄. A neutral pion is a quantum combination of u ū and d d̄ states, rather than two distinct types of pion.',
   'Leptons are fundamental particles that do not experience the strong interaction. Electrons, muons and their associated neutrinos are examples. Mass is not the definition of either family: a tau lepton has more mass than many hadrons. Antiparticles have the same rest mass and opposite additive quantum numbers; a neutral antiparticle can still differ from its particle.',
   'Sum constituent charge, baryon number and strangeness. A quark has baryon number +⅓ and an antiquark −⅓. A lepton has lepton number +1 and its antilepton −1. Conserve charge, baryon number, lepton number, energy and momentum in the processes studied here. Strangeness is conserved in strong interactions but can change in weak interactions.'],
   'p = uud; n = udd; β⁻: d → u + e⁻ + ν̄e',
   {caption:'Quark bookkeeping (charges in units of e)',headers:['Quark','Charge / e','Baryon number','Strangeness'],rows:[['u','+⅔','+⅓','0'],['d','−⅓','+⅓','0'],['s','−⅓','+⅓','−1'],['Antiquark','Opposite sign','−⅓','Opposite sign']]}),
  S('Interactions and exchange diagrams',[
   'Electromagnetic interactions between charged particles are represented by virtual-photon exchange. W⁺ or W⁻ exchange describes charged-current weak processes, including beta decay. Gluons bind quarks; pion exchange is a useful model of the residual strong interaction between nucleons. That nuclear interaction is attractive over a short range and repulsive at very small separations.',
   'In β⁻ decay, n → p + e⁻ + ν̄e; in β⁺ decay inside an energetically allowed nucleus, p → n + e⁺ + νe. Electron capture is p + e⁻ → n + νe. A free proton cannot undergo β⁺ decay without an energy supply. A neutrino interacting with a neutron can produce a proton and electron; an antineutrino interacting with a proton produces a neutron and positron when energetically allowed.',
   'A Feynman diagram is a representation of a process, not a drawing of particle trajectories. Follow its stated time axis and check charge at each vertex to identify a W boson. Antiparticle arrows follow the fermion-flow convention, opposite the time direction for an external antiparticle; they do not mean that a detected particle travels backwards through the apparatus. Virtual particles do not licence a violation of energy conservation.'])
 ],example:E('Find the specific charge of a helium-4 nucleus. Use e = 1.60 × 10⁻¹⁹ C and a nucleon mass of 1.67 × 10⁻²⁷ kg.',[
  'There are two protons, so Q = +2e = +3.20 × 10⁻¹⁹ C. There are four nucleons, so m ≈ 6.68 × 10⁻²⁷ kg.',
  'Q/m ≈ (3.20 × 10⁻¹⁹)/(6.68 × 10⁻²⁷).',
  'Specific charge ≈ +4.79 × 10⁷ C kg⁻¹. This is the bare nucleus; a neutral helium atom has net specific charge zero.'
 ]),check:R('Why must β⁻ decay include an electron antineutrino?','The initial neutron has lepton number zero. The emitted electron contributes +1, so an antineutrino contributes −1. It also carries energy and momentum, accounting for the continuous beta spectrum.')},
 photoelectric:{sections:[
  S('What the observations establish',[
   'Above the threshold frequency, emission begins without an observable accumulation delay. At fixed frequency, raising intensity supplies more photons each second and can increase the emission rate. It does not increase the maximum energy transferred by an individual photon. Below threshold, increasing intensity cannot produce ordinary single-photon photoemission.',
   'One photon transfers its energy hf to one electron. At least the work function φ is needed to escape the surface; any remaining energy becomes kinetic energy. Electrons can lose energy before leaving, so the equation describes the maximum kinetic energy.'],
   'Kmax = hf − φ; f₀ = φ/h; eVs = Kmax'),
  S('Read a photoelectric graph',[
   'On a graph of maximum kinetic energy in joules against frequency in hertz, the straight-line gradient is h, the frequency-axis intercept is f₀ and the extrapolated vertical intercept is −φ. If energy is plotted in eV instead, the numerical gradient is h/e.',
   'Stopping potential Vs is the magnitude of the reverse potential difference needed to stop even the fastest photoelectrons. Increasing frequency raises Vs; increasing intensity at a fixed frequency does not.']),
  S('Photons, pair production and annihilation',[
   'Photon energy is hc/λ and photon momentum is h/λ. An electron and positron initially at rest can annihilate into two opposite photons, each with energy mec² = 0.511 MeV. The opposite momenta conserve the initially zero total momentum.',
   'To create an electron–positron pair, a photon needs at least 2mec² ≈ 1.022 MeV, with a small additional recoil requirement near a nucleus. A single photon cannot create the pair in empty space while conserving both energy and momentum. Energy above the rest-energy requirement becomes kinetic energy and recoil.'])
 ],example:E('Light of wavelength 400 nm falls on a surface with work function 2.00 eV. Find the maximum electron energy.',[
  'Convert λ = 4.00 × 10⁻⁷ m. Photon energy hc/λ ≈ 4.97 × 10⁻¹⁹ J = 3.10 eV.',
  'Kmax = 3.10 − 2.00 = 1.10 eV, so emission is possible.',
  'In joules this is about 1.76 × 10⁻¹⁹ J; the stopping-potential magnitude is about 1.10 V.'
 ]),check:R('Why does a brighter sub-threshold lamp not eject electrons?','Each photon still has energy hf below the work function. More photons per second do not raise the energy of an individual photon in the single-photon model.')},
 quantum:{sections:[
  S('Excitation, ionisation and spectra',[
   'Atomic electrons have discrete allowed energies. Excitation raises an electron to another bound state; ionisation removes it from the atom. With the free electron at rest at infinity assigned zero energy, bound states have negative energies. The ionisation energy from a state is the energy needed to reach zero.',
   'A downward transition emits a photon with energy equal to the positive energy difference. Photon absorption requires a matching allowed transition. An incident electron can cause excitation by transferring the required energy and retaining the remainder. Characteristic energy gaps explain an element’s emission and absorption lines.'],
   'ΔE = hf = hc/λ; 1 eV = 1.602 × 10⁻¹⁹ J'),
  S('Matter waves and electron diffraction',[
   'The de Broglie wavelength is h/p. For a nonrelativistic electron accelerated from rest through potential difference V, eV = p²/(2me). Larger accelerating voltage therefore produces a shorter wavelength and smaller diffraction angles for a fixed crystal spacing.',
   'A thin polycrystalline sample produces rings because many tiny crystals have different orientations. A single crystal can produce spots. These are interference patterns in the detection probabilities, even though the detector records localised electron impacts. At high energies use relativistic momentum rather than √(2me eV).'],
   'λ = h/p = h/√(2me eV) (nonrelativistic)'),
  S('Use the evidence carefully',[
   'The photoelectric effect supports energy transfer in photons. Interference and diffraction support wave behaviour. Electron diffraction supports a wave description of matter, while individual detection events are localised. A simple picture of tiny balls on classical circular atomic orbits does not explain this evidence.'])
 ],example:E('A hydrogen electron falls from −1.51 eV to −3.40 eV. Find the emitted wavelength.',[
  'Photon energy = (−1.51) − (−3.40) = 1.89 eV = 3.03 × 10⁻¹⁹ J.',
  'λ = hc/ΔE = (6.63 × 10⁻³⁴ × 3.00 × 10⁸)/(3.03 × 10⁻¹⁹).',
  'λ ≈ 6.57 × 10⁻⁷ m = 657 nm, in the red region. The photon energy is positive.'
 ]),check:R('What happens to nonrelativistic electron wavelength if the accelerating voltage is quadrupled?','Momentum doubles because p is proportional to √V. The de Broglie wavelength therefore halves.')},
 iv:{sections:[
  S('Charge flow and energy transfer',[
   'Current is charge passing a cross-section per unit time, not the speed of a single electron. Count particles using Q = Ne, with an appropriate sign if signed charge is needed. Potential difference is energy transferred per coulomb; it is measured in J C⁻¹, not newtons.',
   'Charge is conserved around a circuit. Components transfer energy from the electrical system; they do not use up the current. Electron drift in a metal is opposite to conventional current.'],
   'Q = It; W = QV; P = IV = I²R = V²/R'),
  S('Measure and interpret I–V characteristics',[
   'An ammeter is placed in series with the component and a voltmeter in parallel across it. Vary the applied potential difference, record paired I and V values, then reverse polarity for the negative part of the characteristic. Limit current and allow temperature to stabilise where appropriate.',
   'For an ohmic resistor at constant temperature, the I–V characteristic is a straight line through the origin. With I vertically and V horizontally, its gradient is 1/R. A filament’s increasing temperature raises resistance, so its characteristic becomes less steep at larger magnitudes of V. A diode conducts much more readily in its forward direction.']),
  S('Use ratios and gradients correctly',[
   'At a point on a nonlinear characteristic, V/I is the operating resistance. A tangent gives the local rate of change, not generally the same resistance. State which quantity is on each axis before using a gradient. Electrical energy for constant power is Pt; for changing power, use the area under a power–time graph.'])
 ],example:E('A 12 V lamp takes 0.40 A for 3.0 minutes. Find transferred charge and energy.',[
  'Convert time: t = 180 s. Q = It = 0.40 × 180 = 72 C.',
  'W = QV = 72 × 12 = 864 J.',
  'Check using power: P = IV = 4.8 W and Pt = 4.8 × 180 = 864 J.'
 ]),check:R('Why is a voltmeter connected in parallel?','It measures the energy difference per coulomb between two points. Its high resistance draws little current, reducing disturbance to the circuit.')},
 resistivity:{sections:[
  S('Separate material from geometry',[
   'For a uniform wire of length L and cross-sectional area A, resistance is ρL/A. Resistivity is a material property at the specified temperature, in Ω m. Doubling diameter quadruples area, so it quarters resistance at fixed length and resistivity.',
   'Conduction electrons transfer momentum and energy through scattering in the solid. In an ordinary metal, increasing temperature usually increases lattice vibrations and resistivity over the usual laboratory range. Do not apply that trend to every material: an NTC thermistor has falling resistance as temperature rises.'],
   'ρ = RA/L; A = πd²/4'),
  S('From measurements to a reliable value',[
   'Measure diameter at several positions and orientations with a checked micrometer; calculate area from the mean diameter. Measure resistance over several wire lengths using paired current and voltage readings. Keep current small enough to limit heating and check for contact resistance.',
   'For a plot of R against L, gradient = ρ/A. A nonzero intercept can reveal resistance in leads or contacts. Small diameter uncertainty can dominate because area depends on diameter squared.']),
  S('Superconductivity and its applications',[
   'Below the relevant critical temperature, a suitable material can have zero dc electrical resistance. Operating current and magnetic field must also remain within its limits. Persistent currents and strong electromagnets are useful consequences, including magnets used in MRI and particle accelerators.',
   'Cooling and other equipment still require energy. The critical temperature depends on the material and operating conditions; a historical record temperature in old notes should not be treated as a universal maximum.'])
 ],example:E('A 0.40 mm diameter wire gives an R–L gradient of 8.0 Ω m⁻¹. Find resistivity.',[
  'd = 4.0 × 10⁻⁴ m, so A = πd²/4 ≈ 1.26 × 10⁻⁷ m².',
  'Gradient = ρ/A, hence ρ = 8.0 × 1.26 × 10⁻⁷.',
  'ρ ≈ 1.0 × 10⁻⁶ Ω m. The gradient unit Ω m⁻¹ multiplied by m² gives Ω m.'
 ]),check:R('Why use several wire lengths instead of a single resistance measurement?','A fitted gradient reduces the influence of random scatter and separates a roughly constant lead/contact resistance into the intercept.')},
 circuits:{sections:[
  S('Kirchhoff’s laws are conservation statements',[
   'At a junction, sum of currents entering equals sum leaving because charge does not accumulate in steady operation. Around a closed loop, the signed sum of potential changes is zero because energy is conserved. Choose current directions and traverse the loop consistently; a negative solution indicates the opposite direction.',
   'Series components have the same current and their potential differences add. Parallel branches have the same potential difference and their currents add. Adding a parallel resistor reduces the combined resistance.'],
   'Rseries = R₁ + R₂; 1/Rparallel = 1/R₁ + 1/R₂'),
  S('Emf, terminal pd and lost volts',[
   'Emf is energy supplied by a source per coulomb. Terminal pd is energy transferred to the external circuit per coulomb. For a source supplying current, the internal drop is Ir and ε = V + Ir. Despite its name, electromotive force is a voltage, not a mechanical force.',
   'A graph of terminal V against supplied current I has gradient −r and vertical intercept ε in the constant-emf model. At open circuit I is approximately zero and terminal pd approaches emf. Avoid deliberately short-circuiting a real cell.'],
   'V = ε − Ir; Pin = εI; Pexternal = VI; Pinternal = I²r'),
  S('Energy and source limitations',[
   'A low external resistance increases current and internal dissipation. A real cell’s internal resistance and emf may change with temperature, condition and state of charge, so the straight-line model has a limited operating range. Source power is shared between useful external transfer and internal heating.'])
 ],example:E('A 6.0 V source with internal resistance 0.50 Ω supplies two 4.0 Ω resistors in parallel. Find current and terminal pd.',[
  'The external resistance is (1/4.0 + 1/4.0)⁻¹ = 2.0 Ω.',
  'I = ε/(R + r) = 6.0/2.50 = 2.4 A. V = IR = 4.8 V.',
  'Internal drop = 1.2 V. Each branch carries 4.8/4.0 = 1.2 A; the branch currents sum to 2.4 A.'
 ]),check:R('Can a cell have an emf when it supplies no current?','Yes. Emf describes energy supplied per coulomb if charge passes. In an open circuit there is essentially no internal voltage drop, so a high-resistance voltmeter reads approximately the emf.')},
 divider:{sections:[
  S('Choose the output branch first',[
   'Label the resistor across which output is measured before substituting into the divider equation. The larger share of the series resistance has the larger share of the supply potential difference. The simple equation assumes negligible loading.',
   'A load RL across the lower resistor changes that branch to R₂RL/(R₂ + RL). Substitute this effective resistance into the divider equation. A voltmeter of very high resistance causes much less loading than a low-resistance load.'],
   'Vout = Vin R₂/(R₁ + R₂)'),
  S('Turn a sensor change into a voltage change',[
   'For an NTC thermistor in the lower branch, warming reduces its resistance and reduces the output across it. Put it in the upper branch and the output across a fixed lower resistor rises. An LDR’s resistance decreases as illumination increases, so the same branch reasoning applies.',
   'A variable resistor used as a potentiometer selects a position-dependent fraction of a supply. Real sensors have nonlinear characteristics; an even change of temperature or illumination need not give an even voltage change.'])
 ],example:E('A 10 V divider has two 10 kΩ resistors. A 10 kΩ load is connected across the lower resistor. Find output.',[
  'The loaded lower branch is 10 kΩ in parallel with 10 kΩ, giving 5.0 kΩ.',
  'Vout = 10 × 5.0/(10 + 5.0) = 3.33 V.',
  'Without the load the output was 5.0 V. Loading reduces the effective lower resistance and its share of the supply.'
 ]),check:R('How can the same thermistor make output rise or fall as it warms?','The direction depends on which divider branch contains the thermistor and where output is measured. Reason from the resistance ratio, not from a memorised sensor rule.')},
 vectors:{sections:[
  S('Resolve, add and find equilibrium',[
   'Scalars have magnitude only; vectors also require direction. Add vectors head-to-tail or resolve each into perpendicular components and add signed components. For angle θ measured from the positive horizontal axis, Fx = F cosθ and Fy = F sinθ. Use the appropriate quadrant when reconstructing the resultant direction.',
   'Translational equilibrium requires zero resultant force, so both component sums are zero. A body in equilibrium may already be moving with constant velocity. For a rigid body in full static equilibrium, the resultant moment must also be zero.'],
   'Rx = ΣFx; Ry = ΣFy; |R| = √(Rx² + Ry²)'),
  S('Moments and couples',[
   'Moment magnitude about a point is force multiplied by the perpendicular distance from that point to the force’s line of action. A force through the pivot has zero moment, even if it is large. Choose clockwise or anticlockwise as positive and use the same sign convention throughout.',
   'A couple consists of equal, opposite, parallel forces with different lines of action. Its resultant force is zero, but its moment is Fd, where d is the perpendicular separation of those lines. This couple moment is independent of the chosen pivot.'],
   'moment = Fd⊥; equilibrium: ΣF = 0 and Σmoment = 0'),
  S('Centre of mass and toppling',[
   'The centre of mass is a mass-weighted position. In a uniform gravitational field, weight acts through that point and the centre of gravity coincides with it. A uniform beam’s weight acts at its midpoint unless other mass distributions are specified.',
   'An unsupported object topples when the vertical line through its centre of mass lies outside its support base, producing an overturning moment about the edge. A wider base and a lower centre of mass generally increase stability. A freely suspended body settles with its centre of mass below the suspension point.'])
 ],example:E('A 4.0 m uniform beam weighs 100 N. It is hinged at its left end and held horizontal by a vertical force at the right end. Find that force and the hinge’s vertical reaction.',[
  'Take moments about the hinge: the beam’s weight acts 2.0 m from it, so 4.0F = 100 × 2.0.',
  'F = 50 N upward. Vertical equilibrium gives R + 50 − 100 = 0.',
  'The hinge reaction is 50 N upward. Both force and moment balance are needed.'
 ]),check:R('Why can equal opposite forces still rotate a beam?','If their lines of action are separated they form a couple. Their resultant force is zero but their moments add, producing a nonzero torque.')},
 projectile:{sections:[
  S('Read motion graphs with signs',[
   'Distance is total path length, while displacement is change of position with a direction. Average speed is total distance/time; average velocity is displacement/time. An object can return to its starting point with nonzero distance travelled and zero average velocity.',
   'The gradient of displacement–time gives velocity; the gradient of velocity–time gives acceleration. Signed area under velocity–time gives displacement. To find distance travelled, add the magnitudes of areas above and below the time axis. A negative velocity with positive acceleration initially means decreasing speed.']),
  S('Choose a constant-acceleration equation',[
   'List s, u, v, a and t and choose an equation omitting the unknown you do not need. These equations apply to constant acceleration. Resolve into separate axes for projectiles and define the positive direction before assigning g a sign.',
   'Ignoring drag near Earth, horizontal acceleration is zero and vertical acceleration is −g if upward is positive. At the highest point the vertical velocity is zero but acceleration remains −g. Horizontal velocity need not be zero.'],
   'v = u + at; s = ut + ½at²; v² = u² + 2as; s = ½(u + v)t'),
  S('Horizontal launches and landing levels',[
   'For a horizontal launch, first find fall time from the vertical drop, then multiply by the horizontal speed to find range. For an angled launch use ux = u cosθ and uy = u sinθ. The usual range u²sin2θ/g assumes the landing height equals the launch height; it does not apply unchanged to a cliff launch.'])
 ],example:E('A ball leaves a 1.25 m high bench horizontally at 3.0 m s⁻¹. Find the time to the floor and horizontal range. Ignore drag.',[
  'Taking downward positive, vertical motion has u = 0, s = 1.25 m and a = 9.81 m s⁻². t = √(2s/g) ≈ 0.505 s.',
  'Horizontal velocity is constant, so range = 3.0 × 0.505 ≈ 1.51 m.',
  'The vertical impact speed is gt ≈ 4.95 m s⁻¹ downward; the total impact speed is √(3.0² + 4.95²) ≈ 5.79 m s⁻¹.'
 ]),check:R('At the top of a projectile’s flight, which quantities are zero?','The vertical velocity is zero. Horizontal velocity remains constant in the no-drag model, and acceleration is still g downward.')},
 forces:{sections:[
  S('Apply Newton’s laws to one object at a time',[
   'An object has constant velocity when its resultant external force is zero. The general second law is resultant force = rate of change of momentum; for constant mass this becomes ma. The acceleration is in the direction of the resultant force.',
   'Third-law forces arise from the same interaction, are equal and opposite, and act on different objects. Weight and a normal reaction on the same object are not a third-law pair. For a free-body diagram, draw only forces acting on the chosen body.'],
   'ΣF = Δp/Δt; for constant mass ΣF = ma'),
  S('Falling through a fluid',[
   'Immediately after release from rest, drag is small and acceleration may be close to g if upthrust is negligible. As speed rises, drag rises and the resultant downward force falls. At terminal speed, weight balances drag plus upthrust and acceleration is zero.',
   'A parachute increases drag at the current speed. The upward resultant then reduces downward speed until a new, lower terminal speed is reached. A force opposing motion does not automatically mean that the object immediately reverses direction.']),
  S('Apparent weight in a lift',[
   'A scale reads the normal contact force, not directly the gravitational force. Taking upward positive, N − mg = ma. Accelerating upward increases the reading; accelerating downward reduces it. Moving downward at constant velocity still gives N = mg.'])
 ],example:E('A 60 kg person stands on scales in a lift accelerating upward at 1.5 m s⁻². Find the scale reading.',[
  'Draw N upward and mg downward. Choose upward positive: N − mg = ma.',
  'N = m(g + a) = 60(9.81 + 1.5).',
  'The reading is about 679 N. The person’s mass remains 60 kg and gravitational weight remains about 589 N.'
 ]),check:R('What is the third-law partner of Earth’s gravitational force on a person?','The person’s gravitational force on Earth. The floor’s normal force on the person belongs to a different interaction.')},
 energy:{sections:[
  S('Work depends on the force component along displacement',[
   'For constant force, W = Fs cosθ where θ is between force and displacement. The area under a force–displacement graph gives work for a varying force. A force perpendicular to instantaneous motion does no work on a point particle.',
   'Near Earth, ΔEp = mgΔh. Kinetic energy is ½mv². Set a reference level for potential energy and compare changes; the zero of gravitational potential energy is arbitrary in this near-surface model.'],
   'W = Fs cosθ; Ek = ½mv²; ΔEp = mgΔh'),
  S('Power, efficiency and resistance',[
   'Mean power is transferred energy divided by elapsed time. For a force component along motion, instantaneous power is Fv. Efficiency is useful output energy or power divided by total input, using matching quantities.',
   'When an object slows because of friction, energy is transferred into internal energy and sometimes sound. Total energy is conserved even when mechanical energy decreases. State the system boundary and account for energy transferred to the surroundings.'])
 ],example:E('A motor raises a 20 kg load through 3.0 m in 4.0 s. Its input power is 200 W. Find useful power and efficiency.',[
  'Useful energy = mgh = 20 × 9.81 × 3.0 = 588.6 J.',
  'Useful mean power = 588.6/4.0 ≈ 147 W.',
  'Efficiency = 147.15/200 ≈ 0.736, or 74%. About 53 W is transferred to other stores on average.'
 ]),check:R('Why does a frictionless circular orbit not require continuous work by gravity?','For a circular orbit the gravitational force is perpendicular to the instantaneous velocity. It changes direction without changing kinetic energy.')},
 momentum:{sections:[
  S('Choose the system and sign convention',[
   'Momentum is mv, with velocity signs retained. Conservation applies to the total momentum of a system when external impulse is negligible. Internal forces can be large during a collision but cancel in the total impulse because they form third-law pairs.',
   'In an explosion, initial momentum is not automatically zero: it is zero only if the chosen system was initially at rest overall. Kinetic energy can increase using internal energy, while momentum is still conserved.']),
  S('Impulse and safety explanations',[
   'Impulse is the signed area under a resultant force–time graph. For the same change in momentum, a longer stopping time means a smaller mean force. This explains the effect of moving hands while catching a ball, or using a crumple zone, without claiming that the impulse has vanished.',
   'An elastic collision conserves total kinetic energy as well as momentum. In an inelastic collision some kinetic energy transfers to other stores. Sticking together is the perfectly inelastic case; always check kinetic energy separately rather than assuming its conservation.'],
   'impulse = Δp = FmeanΔt; Σpinitial = Σpfinal')
 ],example:E('A 0.15 kg ball moving at +20 m s⁻¹ rebounds at −15 m s⁻¹ in 0.020 s. Find impulse and mean force on the ball.',[
  'Δp = m(v − u) = 0.15(−15 − 20) = −5.25 kg m s⁻¹.',
  'Fmean = Δp/Δt = −5.25/0.020 = −262.5 N.',
  'Impulse is −5.25 N s and mean force is about −260 N. The negative sign gives the direction; using only speeds would give the wrong change.'
 ]),check:R('Does a longer stopping time reduce the impulse for the same initial and final velocities?','No. The change in momentum and therefore impulse are unchanged. A longer stopping time reduces the mean force.')},
 materials:{sections:[
  S('Force, stress and the shape of a material curve',[
   'Stress is tensile force divided by original cross-sectional area; strain is extension divided by original length. Strain is dimensionless. Young modulus is stress/strain in the linear elastic region, so it is the gradient of that part of a stress–strain graph.',
   'The limit of proportionality ends the straight-line region. The elastic limit concerns whether unloading removes all deformation; a material can behave elastically without obeying Hooke’s law over its entire range. Yielding marks substantial plastic strain for some materials. Ultimate tensile strength is maximum engineering stress, and is not necessarily the stress at final fracture.',
   'A stiff material has high Young modulus. A strong material tolerates high stress. A ductile material undergoes substantial plastic strain before fracture; a brittle material fractures with little plastic deformation. These terms describe different properties.'],
   'σ = F/A; ε = ΔL/L; E = σ/ε'),
  S('Springs in series and parallel',[
   'For ideal springs in series, each carries the same tensile force and the extensions add: 1/keff = 1/k₁ + 1/k₂. In parallel between rigid supports, the extensions match and forces add: keff = k₁ + k₂.',
   'The area under a force–extension graph is work done. It is ½kx² in the linear elastic region. Area under a stress–strain curve is work per original volume; it is not simply energy unless multiplied by volume. On unloading after plastic deformation, some work has been dissipated.'],
   'elastic energy = ½Fx = ½kx²; energy density = ½σε (linear elastic)'),
  S('Measure Young modulus',[
   'Use a long, thin sample to make extension measurable. Establish the original length under a small straightening load, measure diameter at several places, and add loads gradually while measuring extension. Remove loads to check whether deformation was elastic. Stay within the safe operating range of the apparatus.',
   'Plot force against extension: gradient k = EA/L, hence E = kL/A. A reference wire can help compensate for support movement or temperature changes. A micrometer zero error or mistaken diameter-to-area conversion can dominate the final result.'])
 ],example:E('Two ideal springs of stiffness 60 and 120 N m⁻¹ support a 6.0 N tensile force in series. Find total extension and stored energy.',[
  '1/keff = 1/60 + 1/120, so keff = 40 N m⁻¹.',
  'Total extension = F/keff = 6.0/40 = 0.15 m. The individual extensions are 0.10 m and 0.050 m.',
  'Stored energy = ½Fxtotal = 0.5 × 6.0 × 0.15 = 0.45 J, assuming both remain in their linear elastic ranges.'
 ]),check:R('Is the steepest stress–strain curve necessarily the strongest material?','No. Its initial gradient indicates stiffness (Young modulus). Strength is assessed from the stress it can withstand, which is a different feature of the curve.')},
 progressive:{sections:[
  S('Separate wave travel from particle motion',[
   'A progressive wave transfers energy away from a source. In the ideal small-amplitude mechanical-wave model, particles oscillate about equilibrium rather than travelling with the pattern. In transverse waves the oscillation is perpendicular to propagation; in longitudinal waves it is parallel.',
   'Wavelength is the shortest distance between points oscillating in phase; period is the time for one complete oscillation at one location. A displacement–position snapshot shows wavelength. A displacement–time trace at one location shows period.'],
   'v = fλ; T = 1/f; Δφ = 2πΔx/λ'),
  S('Phase, path and polarisation',[
   'For two points on the same sinusoidal progressive wave at the same time, phase difference depends on their separation as a fraction of wavelength. Separation λ/4 corresponds to π/2; λ/2 corresponds to π; λ corresponds to 2π and the same phase.',
   'Polarisation restricts transverse oscillations to a plane. Longitudinal oscillations have no transverse plane to select, so they cannot be polarised this way. A receiving radio aerial should align with the electric-field oscillation direction for strongest coupling.'])
 ],example:E('A wave has frequency 5.0 Hz and wavelength 0.80 m. Find speed and the phase difference for points 0.20 m apart.',[
  'v = fλ = 5.0 × 0.80 = 4.0 m s⁻¹.',
  'Δφ = 2πΔx/λ = 2π × 0.20/0.80 = π/2 rad.',
  'The points differ by 90° in phase. Their separation is a quarter wavelength, not a quarter of the amplitude.'
 ]),check:R('Why can sound in air not be polarised by selecting an oscillation plane?','It is longitudinal: particle oscillations are along propagation rather than in a transverse plane.')},
 standing:{sections:[
  S('Build a stationary pattern by superposition',[
   'Two waves of equal frequency and similar amplitude travelling in opposite directions can form a stationary wave. Reflections from the ends of a string supply the counter-travelling wave. Nodes remain at zero displacement; antinodes have the largest oscillation amplitude.',
   'Adjacent nodes are λ/2 apart, as are adjacent antinodes; a node and its nearest antinode are λ/4 apart. Points between the same pair of adjacent nodes oscillate in phase. Points in adjacent loops oscillate in antiphase. An ideal stationary wave has no net time-averaged energy transfer along the string.']),
  S('Find the allowed harmonics',[
   'A string fixed at both ends must have a node at each end. Its length contains an integer number of half wavelengths, giving λn = 2L/n and fn = nv/(2L). For a stretched string v = √(T/μ), where T is tension and μ mass per unit length.',
   'These endpoint conditions matter: a system with different boundary conditions can have a different harmonic sequence. Do not apply the fixed-string formula to every resonating column or instrument without checking the ends.'],
   'fn = n/(2L) √(T/μ), n = 1, 2, 3, …')
 ],example:E('A 0.80 m string has wave speed 160 m s⁻¹. Find its third-harmonic frequency and adjacent-node spacing.',[
  'f₁ = v/(2L) = 160/1.60 = 100 Hz, so f₃ = 300 Hz.',
  'λ₃ = 2L/3 = 0.533 m.',
  'Adjacent-node spacing is λ₃/2 = 0.267 m. The pattern has three loops and four nodes including the ends.'
 ]),check:R('Is the distance from a node to the nearest antinode half a wavelength?','No. It is λ/4. Half a wavelength separates adjacent nodes or adjacent antinodes.')},
 interference:{sections:[
  S('Coherence and path difference',[
   'Coherent sources have the same frequency and a constant phase difference. Equal amplitude is not required for coherence, but is required for complete cancellation at a minimum when the interfering components otherwise match. For initially in-phase sources, constructive interference occurs at path difference nλ; destructive interference at (n + ½)λ.',
   'Two slits illuminated by one monochromatic source can act as coherent sources. With slit separation s and a distant screen at D, small-angle geometry gives fringe spacing w = λD/s. Larger wavelength or screen distance spreads the fringes; larger slit separation compresses them.'],
   'w = λD/s (small angles, D ≫ s)'),
  S('Single slits and gratings',[
   'Diffraction is the spreading associated with a wave passing an aperture or edge. It becomes conspicuous when the opening is comparable to wavelength. A narrower single slit produces a wider central maximum, with weaker side maxima. On a distant screen at small angles, the central maximum is approximately twice the width of each adjacent secondary maximum.',
   'For a grating at normal incidence, d sinθ = nλ. Convert line density into spacing: 500 lines per millimetre means d = 1/(500 × 1000) m. Adding more illuminated slits at fixed d sharpens principal maxima; their angular positions do not move merely because there are more slits.',
   'The maximum allowed order satisfies nλ ≤ d. Distinguish slit width (diffraction envelope) from slit spacing (interference spacing).'],
   'd sinθ = nλ; nmax = floor(d/λ)')
 ],example:E('A grating has 500 lines mm⁻¹ and is illuminated normally with 600 nm light. Find first-order angle and maximum possible order.',[
  'd = 1/(500 × 1000) = 2.00 × 10⁻⁶ m.',
  'sinθ₁ = λ/d = (600 × 10⁻⁹)/(2.00 × 10⁻⁶) = 0.300, so θ₁ ≈ 17.5°.',
  'd/λ = 3.33, so the largest allowed integer order is 3, on either side of zero order.'
 ]),check:R('Must coherent sources have equal amplitudes?','No. Coherence requires equal frequency and a constant phase relationship. Unequal amplitudes reduce fringe contrast and prevent complete cancellation, but do not by themselves destroy coherence.')},
 refraction:{sections:[
  S('Measure every angle from the normal',[
   'Refractive index n = c/v compares the vacuum speed to phase speed in a material. At a boundary the source fixes frequency, so a change in speed changes wavelength. Entering a higher-index material bends a ray towards the normal, except at normal incidence where its direction stays the same.',
   'Snell’s law n₁sinθ₁ = n₂sinθ₂ applies at each interface. A ray at normal incidence has θ = 0°, not 90°. Draw a new normal if the next surface has a different orientation.'],
   'n = c/v; n₁sinθ₁ = n₂sinθ₂'),
  S('Critical angle and fibres',[
   'Total internal reflection is possible only for light travelling towards a lower refractive index, with incidence greater than the critical angle. At the critical angle the refracted ray has angle 90° to the normal. Below it, reflected and transmitted light can both be present.',
   'A fibre has a higher-index core and lower-index cladding, enabling total internal reflection at their boundary while protecting the core and helping keep signals in separate fibres. Rays following different paths can arrive at different times (modal dispersion); material dispersion comes from refractive index depending on wavelength.'],
   'sinθc = n₂/n₁, for n₁ > n₂')
 ],example:E('An optical fibre has core index 1.50 and cladding index 1.45. Find the critical angle at their boundary.',[
  'Light is travelling from higher to lower index, so a critical angle exists.',
  'sinθc = 1.45/1.50 = 0.9667, giving θc ≈ 75.2°.',
  'Incidence angles above 75.2°, measured from the normal inside the core, produce total internal reflection.'
 ]),check:R('Does entering glass change light’s frequency?','No. Its frequency remains fixed by the source. Its speed and wavelength decrease when it enters a higher-index material.')},
 circular:{sections:[
  S('Radians link angle to distance',[
   'One radian is the angle subtended by an arc equal in length to the radius. A complete turn is 2π radians. Angular speed is angle per second, so for uniform motion ω = 2π/T = 2πf. Tangential speed is v = ωr.',
   'Constant speed does not imply constant velocity: its direction changes continually. The acceleration is inward, perpendicular to instantaneous velocity. Real forces such as tension, gravity or friction provide the required inward resultant; do not add a separate extra “centripetal force” to the free-body diagram.'],
   's = rθ; v = ωr; a = v²/r = ω²r'),
  S('Set the inward resultant equal to mv²/r',[
   'For an object at the top of a vertical circle, gravity and tension may both point towards the centre. At the bottom, tension points inward but weight outward. Write the signed inward resultant for that position rather than assuming tension always equals mv²/r.',
   'If the constraint is removed, the object initially follows the tangent in an inertial frame. A rotating frame can use an apparent centrifugal force, but it is not an additional physical interaction that balances the inward force in the inertial analysis.'])
 ],example:E('A 0.20 kg object travels at 4.0 m s⁻¹ at the bottom of a vertical circle of radius 0.80 m. Find string tension.',[
  'At the bottom, inward is upward: T − mg = mv²/r.',
  'mv²/r = 0.20 × 16/0.80 = 4.0 N; mg = 1.962 N.',
  'T = 4.0 + 1.962 ≈ 6.0 N. Tension exceeds the required inward resultant because it must also oppose weight.'
 ]),check:R('Why is there acceleration at constant circular speed?','Acceleration is the rate of change of velocity, which includes direction. The inward resultant continually changes the velocity direction.')},
 shm:{sections:[
  S('The defining relationship and its graphs',[
   'SHM requires a = −ω²x, with x measured from equilibrium. The negative sign specifies restoring acceleration. For x = A cosωt, v = −Aωsinωt and a = −Aω²cosωt. Velocity is a quarter cycle out of phase with displacement; acceleration is in antiphase with displacement.',
   'At equilibrium, speed is greatest and acceleration is zero. At either turning point, speed is zero but the acceleration magnitude is greatest. Gradients connect the x–t, v–t and a–t traces; amplitude A is not distance travelled in a complete oscillation, which is 4A.'],
   'v² = ω²(A² − x²); vmax = ωA; |amax| = ω²A'),
  S('Periods and equilibrium positions',[
   'For a mass on an ideal spring, T = 2π√(m/k). For a simple pendulum at small angles, T = 2π√(L/g), with L from suspension point to the bob’s centre of mass. The ideal pendulum period is independent of bob mass.',
   'For a vertical spring, the static extension satisfies ke = mg. Measure the oscillating displacement from that new equilibrium. Gravity and spring energy both change, but the effective oscillation potential about equilibrium is ½kx²; do not confuse it with the spring’s total elastic energy measured from natural length.']),
  S('Energy exchange and measuring g',[
   'For an ideal mass–spring oscillator, total oscillation energy is ½kA². Kinetic energy is ½k(A² − x²), and potential relative to equilibrium is ½kx². Doubling amplitude quadruples total oscillation energy.',
   'To measure g with a pendulum, time many oscillations and divide by their number, keep amplitude small and repeat. A graph of T² against L has gradient 4π²/g. Repetition reduces random timing scatter but does not correct a consistently wrong length.'])
 ],example:E('A spring oscillator has k = 40 N m⁻¹ and amplitude 0.050 m. Find speed at equilibrium for mass 0.25 kg.',[
  'Total energy = ½kA² = 0.5 × 40 × 0.050² = 0.050 J.',
  'At equilibrium all oscillation energy is kinetic: ½mvmax² = 0.050.',
  'vmax = √(0.100/0.25) ≈ 0.632 m s⁻¹. This also equals A√(k/m).'
 ]),check:R('A bob has zero velocity at a turning point. Must its acceleration also be zero?','No. In SHM it has maximum displacement there, so the restoring acceleration has maximum magnitude and points towards equilibrium.')},
 resonance:{sections:[
  S('Free and forced oscillations',[
   'A displaced system left alone oscillates at its natural frequency if damping is small. A periodic external force drives a forced oscillator; after transients, its steady oscillation frequency matches the driving frequency.',
   'Near resonance, the driver transfers energy efficiently and the response can become large. With damping, steady amplitude is limited because the mean input balances energy dissipated. For a lightly damped displacement response the peak is close to the undamped natural frequency; the exact peak can shift with damping.']),
  S('Damping and phase',[
   'A damping force typically opposes velocity, while the restoring force opposes displacement. Light damping produces decaying oscillations, critical damping returns to equilibrium as quickly as possible without overshoot in the linear model, and overdamping returns without oscillation more slowly.',
   'Increasing damping generally lowers and broadens the resonance peak. For the standard driven oscillator, displacement is nearly in phase with the driving force well below natural frequency, lags by π/2 at the undamped natural frequency, and approaches antiphase well above it. These phase statements compare displacement with force, not with velocity.'])
 ],example:E('A lightly damped oscillator has mass 0.50 kg and stiffness 80 N m⁻¹. Estimate the resonant driving frequency.',[
  'Estimate the natural angular frequency: ω₀ = √(k/m) = √(80/0.50) ≈ 12.65 rad s⁻¹.',
  'f₀ = ω₀/(2π) ≈ 2.01 Hz.',
  'The largest lightly damped displacement response is close to 2.0 Hz. Substantial damping lowers the amplitude and can shift the peak.'
 ]),check:R('Why does a damped oscillator not grow without limit at resonance?','As amplitude and speed rise, damping dissipates more energy per cycle. A steady response is reached when mean supplied power equals mean dissipated power.')},
 thermal:{sections:[
  S('Internal energy is not temperature',[
   'Internal energy is the sum of random microscopic kinetic and potential energies. Temperature determines the direction of net thermal energy transfer and, for an ideal gas, is proportional to mean translational kinetic energy. It is not the total energy stored by a sample.',
   'Two samples can have the same temperature and different internal energies because their amounts, substances or states differ. Thermal equilibrium means no net heat transfer. Heat describes energy transferred because of a temperature difference, rather than a substance stored inside an object.'],
   'T/K = θ/°C + 273.15'),
  S('Heating and changes of state',[
   'Away from phase changes, heating energy is mcΔT when specific heat capacity can be treated as constant. During an equilibrium change of state of a pure substance at constant pressure, energy can change molecular potential energy while temperature remains constant. The latent energy is mL.',
   'Add the stages of a heating calculation separately: warming the initial state, changing state, then warming the final state. A plateau on a heating curve does not mean that energy transfer has stopped. Real measurements are affected by heat loss, apparatus heat capacity and imperfect mixing.'],
   'Q = mcΔT; Q = mL; units: c in J kg⁻¹ K⁻¹, L in J kg⁻¹'),
  S('Absolute temperature and limits of the model',[
   'Gas-law temperatures must be in kelvin, not degrees Celsius. A temperature interval of 1 K equals an interval of 1 °C. Absolute zero is 0 K, or −273.15 °C; do not extend a classical gas model into a claim that all microscopic motion must cease, since quantum effects remain important.'])
 ],example:E('Find the energy to turn 0.20 kg of ice at −10 °C into water at 20 °C. Use cice = 2100, cwater = 4200 J kg⁻¹ K⁻¹ and Lfusion = 3.34 × 10⁵ J kg⁻¹.',[
  'Warm the ice: Q₁ = 0.20 × 2100 × 10 = 4200 J. Melt it: Q₂ = 0.20 × 3.34 × 10⁵ = 66 800 J.',
  'Warm the water: Q₃ = 0.20 × 4200 × 20 = 16 800 J.',
  'Total Q = 87 800 J ≈ 88 kJ, assuming no energy heats the container or escapes to the surroundings.'
 ]),check:R('Why can a melting substance absorb energy without getting hotter?','For an equilibrium phase change, the energy changes microscopic potential energy rather than raising mean kinetic energy. Temperature can remain constant while internal energy increases.')},
 gases:{sections:[
  S('Gas laws and amount of substance',[
   'For a fixed amount of ideal gas, pV is constant at fixed temperature, V/T is constant at fixed pressure, and p/T is constant at fixed volume. Pressure must be absolute and temperature must be in kelvin. Keep mass fixed when comparing states.',
   'One mole contains NA particles. Use n = N/NA or n = mass/molar mass, with matching mass units. Distinguish atomic oxygen from oxygen molecules when choosing molar mass. R = NAk links macroscopic and molecular equations.'],
   'pV = nRT = NkT; p₁V₁/T₁ = p₂V₂/T₂'),
  S('Pressure from momentum transfer',[
   'An ideal-gas model assumes many particles with negligible individual volume, random isotropic motion, elastic collisions and negligible intermolecular forces except during collisions. Collisions with the walls change molecular momentum and produce pressure.',
   'For a cube of side L, one molecule with x-speed vx transfers momentum 2mvx per collision with a given wall, separated by time 2L/vx. Its mean force is mvx²/L. Sum over molecules and divide by wall area: pV = Nm⟨vx²⟩. Isotropy gives ⟨vx²⟩ = ⟨c²⟩/3. Use mean squares, not the square of the mean velocity, which is zero for a stationary gas.'],
   'pV = ⅓Nm⟨c²⟩; ½m⟨c²⟩ = ³⁄₂kT; crms = √(3RT/M)'),
  S('What changing temperature does',[
   'At fixed volume, raising temperature increases both collision frequency and mean momentum transfer per collision, increasing pressure. At fixed pressure, the gas expands as temperature rises. Do not interpret constant pressure as a requirement for an unchanged number of collisions per second.',
   'Real gases depart from the ideal model particularly near condensation, at high density or where molecular interactions are significant. Mean translational kinetic energy depends only on temperature, while rms speed also depends on molecular mass.'])
 ],example:E('A fixed gas sample occupies 2.0 litres at 100 kPa and 300 K. It is compressed to 1.5 litres and heated to 360 K. Find final pressure.',[
  'Use p₂ = p₁(V₁/V₂)(T₂/T₁). The volume ratio can use litres consistently.',
  'p₂ = 100 × (2.0/1.5) × (360/300) kPa.',
  'p₂ = 160 kPa. For a direct substitution into pV = nRT, convert litres to m³ and kPa to Pa.'
 ]),check:R('At the same temperature, do heavy and light ideal-gas molecules have the same rms speed?','No. They have the same mean translational kinetic energy, ³⁄₂kT, but the heavier molecules have lower rms speed because crms is proportional to 1/√m.')},
 gravity:{sections:[
  S('Field strength and potential are different',[
   'Gravitational field strength is force per unit mass and is a vector. Outside a spherical mass it has magnitude GM/r² and points inward. Gravitational potential is potential energy per unit mass, a scalar. Taking zero at infinity gives V = −GM/r.',
   'The radial field component is the negative potential gradient: gr = −dV/dr. The work done by an external agent in moving a mass slowly between two positions is mΔV. Near a planetary surface and over small height changes, this reduces to mgΔh.'],
   '|g| = GM/r²; V = −GM/r; Ep = mV'),
  S('Circular orbits and geostationary satellites',[
   'Gravity supplies the inward resultant: GMm/r² = mv²/r. The orbiting mass cancels, giving v = √(GM/r) and T² = 4π²r³/(GM). Measure r from the planet’s centre, not from its surface.',
   'A geostationary satellite follows a circular equatorial orbit in the direction of Earth’s rotation, with period one sidereal day (about 23 h 56 min). Matching the period alone is insufficient; a tilted orbit would not remain above a fixed ground position.'],
   'Ecircular = −GMm/(2r); Ek = GMm/(2r)'),
  S('Escape energy',[
   'Escape speed is the minimum initial speed for an unpowered object to reach infinity with zero residual speed in an ideal isolated spherical gravitational field. Set ½mv² = GMm/r. It neglects atmosphere, planetary rotation and later propulsion; it is not a statement that a powered rocket must reach that speed at launch.'],
   'vescape = √(2GM/r)')
 ],example:E('A satellite moves from circular orbit radius r to radius 4r around the same planet. Compare speed and period.',[
  'v is proportional to r⁻¹ᐟ², so vnew/vold = 1/√4 = ½.',
  'T is proportional to r³ᐟ², so Tnew/Told = 4³ᐟ² = 8.',
  'The final circular orbit is slower but has eight times the period. A transfer manoeuvre still needs changes of energy and momentum.'
 ]),check:R('Why is gravitational potential negative while escape energy is positive?','Potential is zero at infinity and lower at a finite radius. Positive energy must be supplied to raise the object from its negative bound energy to the escape reference.')},
 electric:{sections:[
  S('Force, field and potential',[
   'Coulomb’s law gives the force between point charges or suitably spherical charge distributions. Electric field is force per unit positive test charge; its direction is outward from positive charge and inward towards negative charge. A negative test charge feels force opposite to the field.',
   'Electric potential is energy per unit charge with a chosen zero. For an isolated point charge with zero at infinity, V = kQ/r and can be positive or negative. A charge q changes potential energy by qΔV. The field is the negative potential gradient, not simply a positive gradient.'],
   'F = k|Qq|/r²; Er = kQ/r²; V = kQ/r; Er = −dV/dr'),
  S('Uniform fields and charged-particle motion',[
   'Between broad parallel plates away from edges, field magnitude is approximately |ΔV|/d. A particle experiences F = qE and acceleration a = qE/m. It is acceleration, not field strength itself, that enters the equations of motion.',
   'A particle entering perpendicular to the field follows a parabolic path under the uniform-field, nonrelativistic assumptions, just as a projectile does under uniform gravity. Its initial velocity component perpendicular to the force stays constant; the component along the force changes.'],
   '|E| = |ΔV|/d; a = qE/m'),
  S('Compare gravitational and electric fields',[
   'Both radial fields have inverse-square strength outside a spherical source and potentials varying as 1/r. Their signs and test objects differ. Superposition adds field vectors and potential scalars; zero potential does not necessarily mean zero field.'],undefined,
   {caption:'Compare the two fields',headers:['Property','Gravitational','Electric'],rows:[['Force on test object','F = mg','F = qE'],['Potential energy','mV','qV'],['Interaction','Attractive for positive masses','Attractive or repulsive'],['Radial potential, zero at infinity','−GM/r','kQ/r'],['Uniform-field analogy','Acceleration g','Acceleration qE/m']]})
 ],example:E('A proton is between plates 0.020 m apart with 400 V between them. Find force and acceleration. Use mp = 1.67 × 10⁻²⁷ kg.',[
  '|E| = 400/0.020 = 2.0 × 10⁴ V m⁻¹.',
  'F = eE = 1.60 × 10⁻¹⁹ × 2.0 × 10⁴ = 3.2 × 10⁻¹⁵ N.',
  'a = F/mp ≈ 1.9 × 10¹² m s⁻², towards the negative plate. The field and acceleration have different units.'
 ]),check:R('Can the midpoint between equal opposite charges have zero potential but nonzero field?','Yes. The scalar potentials cancel, but the electric fields point in the same direction there and add.')},
 capacitor:{sections:[
  S('Capacitance, geometry and stored energy',[
   'Capacitance is charge on either plate divided by potential difference between plates. The two plates carry equal and opposite charges; the ideal capacitor remains neutral overall. For broad parallel plates C = ε₀εrA/d, neglecting edge effects. Larger area or permittivity increases C; greater separation reduces it.',
   'Work done adding a small charge is VΔQ. Summing it gives the area under the V–Q graph, ½QV. Use ½CV² or Q²/(2C) depending on which quantity is fixed. Inserting a dielectric while connected to a fixed-voltage source is a different energy problem from inserting it after disconnecting the source.'],
   'C = Q/V; C = ε₀εrA/d; energy = ½QV = ½CV² = Q²/(2C)'),
  S('Charging and discharging curves',[
   'For charging an initially uncharged capacitor through R from an ideal source Vs, Vc = Vs(1 − e⁻ᵗ⁄ᴿᶜ), Q = CVc and current magnitude is (Vs/R)e⁻ᵗ⁄ᴿᶜ. The current is largest initially and tends to zero as the capacitor voltage approaches the source voltage.',
   'For discharge through R, Q, V and current magnitude all fall exponentially. Relative to the original charging-current direction the discharge current is negative. No charge crosses the ideal insulating gap: electrons move through the external circuit as plate charges change.'],
   'Qdischarge = Q₀e⁻ᵗ⁄ᴿᶜ; Vdischarge = V₀e⁻ᵗ⁄ᴿᶜ; τ = RC'),
  S('Read the time constant and linearise',[
   'After one time constant, a discharging value is e⁻¹ ≈ 36.8% of its initial magnitude; a charging voltage has reached 63.2% of its final value. After five time constants the charging voltage is about 99.3% of its final value, not exactly 100%.',
   'A plot of ln(V/Vref) against t for discharge is straight with gradient −1/(RC). Use a stated reference voltage to make the logarithm’s argument dimensionless. The time to halve is RC ln2, not RC.'],
   't = RC ln(Q₀/Q); thalf = RC ln2')
 ],example:E('A 220 μF capacitor charged to 9.0 V discharges through 10 kΩ. Find its voltage after 4.4 s and initial stored energy.',[
  'τ = RC = 10 000 × 220 × 10⁻⁶ = 2.2 s, so 4.4 s is two time constants.',
  'V = 9.0e⁻² ≈ 1.22 V.',
  'Initial energy = ½CV₀² = 0.5 × 220 × 10⁻⁶ × 81 = 8.91 × 10⁻³ J.'
 ]),check:R('Does doubling R change the final charge reached with the same ideal supply?','No. The final charge is CVs. Doubling R doubles the time constant and halves initial current, changing how quickly that charge is approached.')},
 magnetic:{sections:[
  S('Directions and force on a current-carrying wire',[
   'Magnetic field lines point from north to south outside a magnet. Around a straight wire, use the right-hand grip rule with thumb along conventional current. A dot denotes a vector out of the page and a cross into the page.',
   'For a wire in a uniform external field, force magnitude is BIL sinθ where θ is the angle between current and field. Fleming’s left-hand rule gives force direction: first finger field, second finger conventional current, thumb force. Only the wire length within the field contributes.'],
   'F = BIL sinθ; 1 T = 1 N A⁻¹ m⁻¹'),
  S('Charged particles and circular paths',[
   'A particle feels magnetic force magnitude |q|vB sinθ. The direction follows q(v × B), reversing for negative charge. A purely magnetic force is perpendicular to velocity, so it changes direction without doing work or changing speed.',
   'For entry perpendicular to a uniform field, |q|vB = mv²/r gives r = mv/(|q|B) in the nonrelativistic model. Entry with a component parallel to the field produces a helical path. A larger radius can mean larger momentum, smaller charge magnitude or weaker field.'],
   'r = mv/(|q|B); T = 2πm/(|q|B)'),
  S('Connect the model to instruments',[
   'A cyclotron accelerates particles electrically across the gap between two hollow electrodes; magnetic fields bend the paths within the electrodes. The classical orbital frequency is independent of speed, but relativistic mass-energy effects eventually spoil that simple timing.',
   'In magnetic mass analysis, ions with the same speed and charge have radii proportional to mass. If ions instead gain the same kinetic energy from the same accelerating voltage, their speeds differ and r = √(2mV/|q|)/B. State which quantity is held constant.'])
 ],example:E('A proton enters a 0.20 T field at right angles with speed 2.0 × 10⁶ m s⁻¹. Find orbit radius.',[
  'Equate inward magnetic force and mv²/r: r = mpv/(eB).',
  'r = (1.67 × 10⁻²⁷ × 2.0 × 10⁶)/(1.60 × 10⁻¹⁹ × 0.20).',
  'r ≈ 0.104 m. An electron at the same speed has a much smaller radius and curves in the opposite sense.'
 ]),check:R('Why does a uniform magnetic field not increase a particle’s kinetic energy?','Its force is perpendicular to the instantaneous velocity, so its power F·v is zero. It can change momentum direction while leaving speed unchanged.')},
 induction:{sections:[
  S('Flux and flux linkage',[
   'Magnetic flux through a flat area in a uniform field is BA cosθ, where θ is between the field and the area’s normal. A coil face perpendicular to the field has maximum flux; a face parallel to the field has zero flux. Flux linkage is NΦ when all N turns link the same flux.',
   'A rotating coil has linkage NBA cosωt when its normal starts aligned with the field. Flux linkage is a signed quantity. Its rate of change, not its magnitude alone, determines induced emf.'],
   'Φ = BA cosθ; linkage = NΦ; units: Wb and Wb turns'),
  S('Faraday’s and Lenz’s laws',[
   'Faraday’s law gives ε = −d(NΦ)/dt. Lenz’s law supplies the sign: any induced current acts to oppose the change that produces it. A stationary coil in a constant field has no induced emf simply because the field is strong. Induced emf can exist in an open circuit; a current also requires a conducting path.',
   'For a straight conductor moving perpendicular to both its length and a uniform field, emf magnitude is Blv. In a rotating-coil generator, maximum emf occurs when flux linkage passes through zero most rapidly, and zero emf when linkage is at an extremum.'],
   'εrotating = NBAω sinωt'),
  S('Use conservation of energy to check direction',[
   'Push a magnet towards a conducting coil and the induced field opposes the increasing flux, producing a force resisting insertion. Pull it away and the force opposes withdrawal. The required mechanical work supplies electrical energy and heating; an induced current that assisted both motions would contradict energy conservation.'])
 ],example:E('A 200-turn coil of area 0.010 m² flips through 180° in a 0.050 T field in 0.10 s, starting with its normal along the field. Find mean emf magnitude.',[
  'Initial linkage = NBA = 200 × 0.050 × 0.010 = 0.100 Wb turns. Final linkage = −0.100 Wb turns.',
  '|Δ(NΦ)| = 0.200 Wb turns, so |εmean| = 0.200/0.10.',
  'Mean emf magnitude is 2.0 V. This is a mean over the flip, not the peak emf during rotation.'
 ]),check:R('Can a coil have maximum flux linkage at the instant its induced emf is zero?','Yes. At an extremum of sinusoidal flux linkage its rate of change is zero, so Faraday’s law gives zero instantaneous emf.')},
 ac:{sections:[
  S('Peak, peak-to-peak and rms',[
   'For a sinusoidal voltage centred on zero, peak-to-peak is twice the amplitude and rms is amplitude/√2. RMS voltage is the dc voltage that gives the same mean heating power in a fixed resistor. The mean signed voltage over a full cycle is zero, but the mean of V² is not.',
   'The √2 conversion applies to sinusoids; it is not a universal relationship for every waveform. For a resistive load, mean power is VrmsIrms = Vrms²/R.'],
   'Vrms = V₀/√2; Irms = I₀/√2 (sinusoidal)'),
  S('Read an oscilloscope trace',[
   'An oscilloscope displays voltage against time. Voltage is vertical divisions multiplied by volts per division; period is horizontal divisions for one cycle multiplied by seconds per division. Measure peak from the zero-voltage line, or measure peak-to-peak and halve it for a centred sinusoid.',
   'Measure several cycles and divide their total duration by the cycle count to reduce fractional reading uncertainty. The instrument measures voltage directly; displaying current requires an appropriate sensor or a known sensing resistor. A dc signal may appear as a horizontal offset under dc coupling.'],
   'Vpp = vertical divisions × V/div; T = horizontal divisions × s/div; f = 1/T'),
  S('Transformers and transmission',[
   'An alternating primary current produces changing flux in a core and induces secondary emf. For an ideal transformer, Vs/Vp = Ns/Np and VpIp = VsIs. A steady dc input does not produce a sustained changing flux and is not a suitable transformer supply.',
   'At fixed transmitted power, stepping up voltage reduces current and cable heating I²R. Low-resistance windings reduce copper losses. A laminated insulated core reduces eddy currents; suitable soft magnetic material reduces hysteresis losses. A transformer’s efficiency compares useful output power with input power.'],
   'Vs/Vp = Ns/Np; ideal Ip/Is = Ns/Np; efficiency = Ps/Pp')
 ],example:E('A centred sinusoidal trace is 6.0 divisions peak-to-peak at 2.0 V/div. One cycle spans 4.0 divisions at 5.0 ms/div. Find rms voltage and frequency.',[
  'Vpp = 6.0 × 2.0 = 12 V, so V₀ = 6.0 V and Vrms = 6.0/√2 ≈ 4.24 V.',
  'T = 4.0 × 5.0 ms = 20 ms = 0.020 s.',
  'f = 1/T = 50 Hz. Do not use the full peak-to-peak height as the amplitude.'
 ]),check:R('How does doubling transmission voltage change cable losses at fixed delivered power and cable resistance?','It halves the current, so I²R losses fall to one quarter in the simple transmission model.')},
 scattering:{sections:[
  S('What alpha scattering tells us',[
   'Most alpha particles pass through thin foil with little deflection, consistent with most atomic volume being outside a tiny nucleus. The small fraction scattered through large angles supports a concentrated positive charge and mass. An evacuated path and thin target reduce unwanted scattering and energy loss.',
   'At a head-on closest approach in a Coulomb-only model, the alpha particle’s initial kinetic energy becomes electric potential energy. This estimates an upper bound on nuclear size when the alpha turns back before touching the nucleus; it is not a direct measurement of the nuclear surface.'],
   'Kα = k(2e)(Ze)/rmin (head-on, negligible recoil)'),
  S('Nuclear radius and density',[
   'Electron diffraction provides structural information because the de Broglie wavelength can be comparable to nuclear dimensions. Higher momentum gives shorter wavelength and can resolve finer features. High-energy electrons require relativistic momentum, so the low-voltage √(2me eV) formula must not be carried over unchanged.',
   'Nuclear radius follows the approximate empirical relationship R = r₀A¹ᐟ³. Nuclear volume is proportional to A, as is mass, so estimated nuclear density is approximately independent of A. A graph of R against A¹ᐟ³ has gradient r₀.'],
   'R = r₀A¹ᐟ³; ρ ≈ 3mnucleon/(4πr₀³)')
 ],example:E('Using r₀ = 1.2 fm, estimate the radius of a nucleus with A = 125 and its density. Use nucleon mass 1.67 × 10⁻²⁷ kg.',[
  '125¹ᐟ³ = 5, so R = 1.2 × 5 = 6.0 fm = 6.0 × 10⁻¹⁵ m.',
  'Mass ≈ 125 × 1.67 × 10⁻²⁷ = 2.09 × 10⁻²⁵ kg; volume = 4πR³/3 ≈ 9.05 × 10⁻⁴³ m³.',
  'Density ≈ 2.3 × 10¹⁷ kg m⁻³. The value depends on the approximate radius parameter; the lack of A dependence is the key result.'
 ]),check:R('Does an alpha particle’s Coulomb closest-approach distance equal the nuclear radius?','Not necessarily. If it turns around outside the nucleus, the distance sets an upper limit on radius rather than locating the nuclear surface.')},
 decay:{sections:[
  S('Radiation and nuclear changes',[
   'Alpha radiation is helium nuclei; β⁻ is electrons and β⁺ is positrons emitted in nuclear transformations; gamma radiation is high-energy photons from nuclear de-excitation. In α decay, A decreases by 4 and Z by 2. In β⁻, A stays fixed and Z increases by 1; in β⁺ or electron capture, A stays fixed and Z decreases by 1. Gamma emission leaves A and Z unchanged.',
   'On an N-against-Z plot, light stable nuclei are close to N = Z, while heavier stable nuclei usually need more neutrons. Do not omit the (anti)neutrino from beta equations: it is essential for lepton-number, energy and momentum accounting.'],undefined,
   {caption:'Qualitative comparison at typical school energies',headers:['Radiation','Charge / e','Ionising ability','Penetration'],rows:[['α','+2','High, short range','Stopped by thin paper / outer skin'],['β⁻','−1','Intermediate','Reduced by a few mm of aluminium'],['γ','0','Lower per unit path','Attenuated by thick lead or concrete']]}),
  S('Random events, predictable populations',[
   'A nucleus has a constant decay probability per unit time in the model, independent of its age. Individual decay times are unpredictable, but large populations follow an exponential expectation. Activity λN is decays per second, measured in Bq; it is not automatically the count rate recorded by a detector.',
   'Half-life is ln2/λ. Subtract background count rate before using detector readings to estimate a half-life. Count fluctuations limit precision; counting for longer can reduce relative statistical uncertainty.'],
   'N = N₀e⁻λt; A = λN = A₀e⁻λt; T½ = ln2/λ'),
  S('Inverse-square measurements',[
   'For an approximately isotropic point source without significant absorption, intensity varies as 1/r² because the same power crosses spheres of area 4πr². Plot background-corrected count rate against 1/r² and inspect linearity.',
   'At very small separations, source size, detector dimensions and the distance to the active detector region matter. At larger distances background becomes a greater fraction of measured counts. Shielding, absorption and detector dead time can also invalidate a simple inverse-square fit.'])
 ],example:E('A detector reads 180 counts min⁻¹ initially and 60 counts min⁻¹ after 12 hours. Background is 20 counts min⁻¹. Find half-life.',[
  'Correct the readings: 180 − 20 = 160 and 60 − 20 = 40 counts min⁻¹.',
  'The source contribution falls to ¼, which is two half-lives.',
  'Half-life = 12/2 = 6.0 hours. Using the uncorrected ratio would give the wrong result.'
 ]),check:R('Does an old undecayed nucleus have a higher probability of decaying in the next second?','No, in the exponential model its probability per unit time remains the same. A falling sample activity reflects fewer undecayed nuclei, not ageing of those that remain.')},
 binding:{sections:[
  S('Mass defect and energy units',[
   'The rest mass of a bound nucleus is smaller than the sum of the rest masses of its separated protons and neutrons. Their difference is mass defect. Binding energy is the energy required to separate the whole nucleus into those nucleons; it equals Δmc².',
   'Use consistent mass data: nuclear masses with proton and neutron masses, or neutral atomic masses with hydrogen-atom masses and the correct electron bookkeeping. Mixing an atomic mass with bare proton masses introduces an error. One atomic mass unit corresponds to about 931.5 MeV/c².'],
   'Δm = Zmp + (A − Z)mn − mnucleus; Eb = Δmc²'),
  S('Read the binding-energy curve accurately',[
   'Binding energy per nucleon is total binding energy divided by A. It measures average binding, not the exact energy required to remove any particular nucleon. That removal energy depends on the daughter nucleus.',
   'The broad maximum near iron and nickel is about 8.8 MeV per nucleon. Fusion of suitable light nuclei and fission of suitable heavy nuclei can increase total binding energy, releasing the difference. Do not infer that every heavy nucleus must spontaneously split, or that the total binding energy is greatest at iron simply because the per-nucleon value is near its maximum.'])
 ],example:E('A nucleus has mass defect 0.0304 u and A = 4. Estimate total binding energy and binding energy per nucleon.',[
  'Eb = 0.0304 × 931.5 ≈ 28.3 MeV.',
  'Binding energy per nucleon = 28.3/4 ≈ 7.08 MeV.',
  'The total is the energy to separate all four nucleons. The per-nucleon average is not an exact single-nucleon separation energy.'
 ]),check:R('If products have greater total binding energy than reactants, is energy absorbed or released?','Energy is released. More tightly bound products have lower total rest mass, so the decrease in rest energy appears as kinetic energy and radiation.')},
 'nuclear-energy':{sections:[
  S('Fission, fusion and chain reactions',[
   'Induced fission can occur when a fissile nucleus such as uranium-235 absorbs a neutron and splits into lighter nuclei, releasing energy and further neutrons. A sustained chain reaction requires, on average, one neutron from each fission to cause another fission. Geometry, material, neutron leakage and absorption all affect criticality.',
   'Fusion joins suitable light nuclei and can release energy because the products are more tightly bound overall. Positive nuclei repel, so high temperatures and adequate confinement are needed to achieve sufficient reaction rates. Nuclear reactions conserve nucleon number and charge; released energy follows the mass difference.']),
  S('Identify each reactor component’s job',[
   'In a thermal reactor, the moderator slows neutrons mainly by collisions; it should not absorb too many. Control rods absorb neutrons to control the chain reaction. Coolant transfers thermal energy away from the core, often to a separate steam circuit through a heat exchanger. Fuel, moderator, control rods and coolant have distinct roles even when one material performs more than one job.',
   'The energy path is nuclear changes → internal energy → steam and turbine motion → electrical transfer by a generator. A condenser returns steam to liquid in the appropriate circuit. Reactor designs differ, so this is a functional model rather than a diagram of every power station.']),
  S('Shutdown, shielding and waste',[
   'Inserting control rods suppresses the fission chain reaction, but radioactive fission products continue to produce decay heat. Cooling is still needed after shutdown. Shielding, containment, remote handling and multiple cooling provisions reduce risk; they do not make accidents physically impossible.',
   'Waste requires handling appropriate to its activity, half-lives, heat production and physical form. Some spent fuel requires cooling and shielding; immobilisation and engineered containment can limit release. Avoid assigning one universal storage time or disposal method to every waste category.'])
 ],example:E('A reactor produces 3.0 GW of thermal power. If each fission releases 200 MeV, estimate the fission rate and electrical output at 35% efficiency.',[
  'Energy per fission = 200 × 10⁶ × 1.60 × 10⁻¹⁹ = 3.2 × 10⁻¹¹ J.',
  'Fission rate = 3.0 × 10⁹/(3.2 × 10⁻¹¹) ≈ 9.4 × 10¹⁹ s⁻¹.',
  'Electrical output = 0.35 × 3.0 GW = 1.05 GW. The remaining energy is transferred mainly as waste heat.'
 ]),check:R('Why must reactor cooling continue after control rods are fully inserted?','Stopping the sustained fission chain does not stop radioactive fission products decaying. Their decay heat must still be removed.')}
 };
 // One chapter entry for every lesson listed in the supplied document's contents.
 const chapterGroups=[
  ['1','Particles, quantum phenomena & electricity',[
   ['Constituents of the atom','particles'],['Particles and antiparticles','photoelectric'],['Quarks','particles'],['Hadrons','particles'],['Leptons','particles'],['Forces and exchange particles','particles'],['The strong interaction','particles'],['The weak interaction','particles'],['Feynman diagrams','particles'],['The photoelectric effect','photoelectric'],['Excitation, ionisation and energy levels','quantum'],['Wave–particle duality','quantum'],['Charge, voltage, current and resistance','iv'],['Ohm’s law and I–V graphs','iv'],['Resistivity and superconductivity','resistivity'],['Series and parallel circuits','circuits'],['Electrical energy and power','iv'],['Emf and internal resistance','circuits'],['Kirchhoff and potential dividers','divider'],['Alternating current','ac'],['The oscilloscope','ac']]],
  ['2','Mechanics, materials & waves',[
   ['Scalars and vectors','vectors'],['Resolving vectors','vectors'],['Moments','vectors'],['Velocity and acceleration','projectile'],['Motion graphs','projectile'],['Equations of motion','projectile'],['Terminal velocity and projectiles','forces'],['Newton’s laws','forces'],['Work, energy and power','energy'],['Conservation of energy','energy'],['Hooke’s law','materials'],['Stress and strain','materials'],['Bulk properties of solids','materials'],['Young modulus','materials'],['Progressive waves','progressive'],['Longitudinal and transverse waves','progressive'],['Superposition and standing waves','standing'],['Refraction','refraction'],['Total internal reflection','refraction'],['Interference','interference'],['Diffraction','interference']]],
  ['4','Fields & further mechanics',[
   ['Momentum and collisions','momentum'],['Force and impulse','momentum'],['Circular motion','circular'],['Centripetal force and acceleration','circular'],['Simple harmonic motion','shm'],['SHM graphs','shm'],['SHM time periods','shm'],['Resonance and damping','resonance'],['Gravitational fields','gravity'],['Gravitational potential','gravity'],['Orbits and escape velocity','gravity'],['Electric fields','electric'],['Electric potential','electric'],['Fields comparison','electric'],['Capacitors','capacitor'],['Charging and discharging','capacitor'],['Exponential decay','capacitor'],['Force on a current-carrying wire','magnetic'],['Force on a charged particle','magnetic'],['Magnetic flux and flux linkage','induction'],['Electromagnetic induction','induction'],['Transformers','ac']]],
  ['5','Nuclear & thermal physics',[
   ['Rutherford scattering','scattering'],['Ionising radiation','decay'],['Radioactive decay','decay'],['Modes of decay','decay'],['Nuclear radius','scattering'],['Mass and energy','binding'],['Fission and fusion','nuclear-energy'],['Nuclear reactors','nuclear-energy'],['Nuclear safety aspects','nuclear-energy'],['Heat, temperature and internal energy','thermal'],['Specific heat capacity and latent heat','thermal'],['Gas laws','gases'],['Ideal gas','gases'],['Molecular kinetic theory','gases']]]
 ];
 const topics=new Map();for(const [unitId,unit]of Object.entries(window.PhysicsUnits))for(const topic of unit.topics)topics.set(topic.id,{unitId,topic});
 for(const [id,data]of Object.entries(notes)){const entry=topics.get(id);if(!entry)throw Error('Unmapped notes topic: '+id);entry.topic.notes={...data,chapters:[]};}
 window.PhysicsNotesChapters=chapterGroups.map(([unit,title,chapters])=>({unit,title,chapters:chapters.map(([name,id],i)=>{const entry=topics.get(id),chapter={name,unit,number:i+1,topic:id,topicTitle:entry.topic.title,unitId:entry.unitId,href:`learn.html?unit=${entry.unitId}#${id}`};entry.topic.notes.chapters.push(`Unit ${unit} · ${i+1} ${name}`);return chapter;})}));
})();
