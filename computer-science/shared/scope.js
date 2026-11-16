/* Editorial scope notes, separate from the original interactive models. */
(() => {
  'use strict';
  const extra = (match, detail) => ({match, detail, kind: 'extra'});
  const related = (match, detail) => ({match, detail, kind: 'related'});
  const scopes = {
    '02': {
      risc: {
        ref: '1.1.2(a)', core: 'Differences between CISC and RISC processors, their uses, and explanations of the design trade-offs.',
        notes: [
          related(/pipelining|pipeline stages|pipeline stays/i, 'Pipelining is related OCR content in 1.1.1(d), brought in here to explain processor design.'),
          extra(/execution time =|average cycles per instruction|cycles each|cycles per second|[12] GHz|million instructions|microarchitecture/i, 'The instruction-count × cycles-per-instruction ÷ frequency calculation and microarchitecture terminology are supporting detail; this formula is not named in 1.1.2(a). Clock speed itself is covered in 1.1.1(c).')
        ]
      },
      gpu: {
        ref: '1.1.2(b)', core: 'GPUs and their uses, including uses outside graphics; why suitable workloads benefit from parallel processing.',
        notes: [
          extra(/groups that execute|different branches|branch-heavy|execution group|instruction paths/i, 'Grouped GPU execution and branch divergence are implementation detail beyond the named GPU requirement.'),
          extra(/prepares data on the CPU|GPU-accessible memory|launch overhead|preparation and transfer|transfer out|GPU-path costs|data already resides|shared memory|shares memory/i, 'The accelerator transfer/launch workflow is extra implementation context, rather than a prescribed OCR GPU architecture.')
        ]
      },
      parallel: {
        ref: '1.1.2(c)', core: 'Multicore and parallel systems, the opportunities to divide work, and reasons additional cores may not provide proportional improvement.',
        notes: [
          extra(/fraction s|T₁|ideal speedup is|theoretical maximum speedup|maximum possible speedup|infinitely many cores|serial fraction|ideal time on four|100-unit job|0\.5 × 100|Parallel work = 50|Total time = 50|On eight cores/i, 'This serial-fraction calculation illustrates Amdahl’s law. Understanding limits to parallelism is relevant; memorising this formula is not a named requirement of 1.1.2(c).'),
          extra(/race condition|atomic|both read a counter|lock can prevent|need the same lock/i, 'The shared-counter race and thread-synchronisation mechanisms are extra implementation detail used to explain coordination costs.')
        ]
      }
    },
    '03': {
      io: {
        ref: '1.1.3(a)', core: 'Apply suitable input, output and storage devices to different problems, with justified choices based on the scenario.',
        notes: [
          related(/analogue-to-digital|continuously varying|resolution determines|sampling too|sampling interval|samples once/i, 'Sampling and digital representation connect to OCR 1.4.1 (representation of sound/images); here they support choosing and explaining sensors.'),
          extra(/separate on\/off thresholds|repeatedly switching/i, 'Separate switching thresholds (hysteresis) are practical control-system context beyond this named device-selection requirement.')
        ]
      },
      storage: {
        ref: '1.1.3(a–b)', core: 'Uses of magnetic, flash and optical storage, with mechanisms and trade-offs supporting a justified device choice.',
        notes: [
          extra(/program\/erase endurance|controllers manage wear|faulty blocks|retention arrangements/i, 'Flash wear-management and retention arrangements are additional practical detail, rather than prescribed implementation knowledge.'),
          extra(/complete backup strategy|independent copy|version history|off-site protection/i, 'These backup-design precautions provide practical context beyond comparing the named storage media.')
        ]
      },
      ram: {
        ref: '1.1.3(c)', core: 'RAM and ROM: their roles, volatility, normal read/write behaviour and use for working data or persistent instructions.',
        notes: [
          extra(/autosave|recovery copy|recovery,|restore the missing/i, 'Autosave and recovery-copy behaviour depend on the application; they are extra context for the core distinction between volatile working data and a saved file.'),
          related(/paging|working sets|resident/i, 'Paging and virtual memory are related OCR content in 1.2.1(b), used here to explain a possible benefit of extra RAM.')
        ]
      },
      'virtual-storage': {
        ref: '1.1.3(d)', core: 'Virtual storage: the logical presentation of storage, its physical backing, and benefits or limitations in a scenario.',
        notes: [
          extra(/synchronis|replicat|backup|version|recycle bin|freshness|conflicting edits/i, 'Synchronisation, replication, version retention and backup recovery are practical storage-service context. These specific service mechanisms are not individually named in 1.1.3(d).'),
          related(/virtual memory|address space used by processes/i, 'Virtual memory is a separate OCR topic, 1.2.1(b); this comparison prevents confusing it with virtual storage.')
        ]
      }
    },
    '04': {
      os: {
        ref: '1.2.1(a)', core: 'The need for, function and purpose of operating systems: resource management, protection, interfaces and services.',
        notes: [
          extra(/system call|kernel|privilege|protected service|controlled interface|resource boundary/i, 'Kernel privilege and system-call boundaries explain one way an OS implements its required services; the exact calling mechanism is extra implementation detail.'),
          extra(/cached copy may|spool|raw device commands/i, 'Caching and print-spooling arrangements are illustrative implementation choices, not one mandatory OS design.')
        ]
      },
      memory: {
        ref: '1.2.1(b)', core: 'Memory management: paging, segmentation and virtual memory, including explanations of address mapping and why storage-backed paging can be slow.',
        notes: [
          extra(/FIFO|longest resident|resident longest|oldest resident|arrival order|replacement policy/i, 'FIFO is an illustrative page-replacement policy. It is not one of the memory-management mechanisms named in 1.2.1(b); it must not be confused with FCFS CPU scheduling.'),
          extra(/modified victim|writing back first|write to backing|faulting process|instruction can be retried/i, 'Dirty-page write-back and instruction retry are extra implementation detail explaining the cost of a page fault.')
        ]
      },
      interrupts: {
        ref: '1.2.1(c)', core: 'Interrupts and ISRs, their role in the fetch–decode–execute cycle, and saving/restoring enough state to resume correctly.',
        notes: [
          extra(/non-maskable|nested handling|which priorities may|architecture and OS|hardware\/OS split/i, 'Non-maskable events, nested handling and the precise hardware/OS division are additional implementation context; no one architecture’s rules are prescribed here.')
        ]
      },
      scheduling: {
        ref: '1.2.1(d)', core: 'Round robin, FCFS, multi-level feedback queues, shortest job first and shortest remaining time; trace and compare the policies.',
        notes: [
          extra(/turnaround|response =|response times|waiting =|mean waiting|waiting times|first-run delay/i, 'These formal scheduling metrics quantify the examples. The five scheduling policies are named requirements; these particular metric formulas are supporting analysis, not a separately listed requirement in 1.2.1(d).'),
          extra(/ageing|aging|periodic boosts|priority boost|quantum values|quantum = 2|two-unit quantum|queue counts|quantums and arrival rules/i, 'Round-robin time slices are part of the required policy. The particular quantum values, feedback-queue configuration, ageing and boost rules in the examples are illustrative design choices, not universal OCR-prescribed settings.')
        ]
      },
      'os-types': {
        ref: '1.2.1(e)', core: 'Distributed, embedded, multitasking, multi-user and real-time operating systems; identify and justify suitable characteristics.',
        notes: [
          extra(/hard real-time|soft real-time|hard deadline|worst-case bounds/i, 'The hard/soft real-time distinction and formal worst-case bounds are added context. The required point is that a real-time system must meet its specified timing constraints.'),
          extra(/partial failures|cloud application|one machine or link/i, 'Partial-failure behaviour and distributed-application versus distributed-OS distinctions add practical context to the required OS category.')
        ]
      },
      bios: {
        ref: '1.2.1(f)', core: 'The BIOS and its role in initialising hardware and starting the boot process before the operating system is available.',
        notes: [
          extra(/UEFI|reset location|architecture-defined|reset →/i, 'UEFI and architecture-specific reset/startup details are modern implementation context beyond the named BIOS requirement.')
        ]
      },
      drivers: {
        ref: '1.2.1(g)', core: 'Device drivers: why they are needed and how they connect OS/application services to hardware-specific operation.',
        notes: [
          extra(/class driver|class or model driver|standard class|privilege|native|model-specific download/i, 'Class-driver deployment and driver privilege arrangements are practical implementation detail beyond the basic driver role.')
        ]
      },
      vm: {
        ref: '1.2.1(h)', core: 'Virtual machines, including executing intermediate code and running one operating system within another.',
        notes: [
          extra(/hypervisor|hosted arrangement|directly on the underlying|virtual CPUs|overcommit/i, 'Hypervisor arrangements and resource-overcommit mechanisms are supporting implementation context; the required concept is software taking on a machine’s function.'),
          extra(/snapshot|licensing|native dependencies|native components|compiles parts into native/i, 'Snapshots, licensing, native dependencies and just-in-time-style execution are extra practical details, not separately named VM requirements.')
        ]
      }
    },
    '09': {
      compression: {
        ref: '1.3.1(a)', core: 'Lossy versus lossless compression, why compression is useful, its trade-offs and choosing an appropriate type for a scenario.',
        notes: [
          extra(/quantisation|quantization|perceptual model|master|JPEG|colour levels/i, 'Channel quantisation and perceptual-codec details are supporting examples of lossy behaviour, not a required JPEG/audio-codec implementation.'),
          related(/bits per pixel|image stores three|channel now has|transmission time|bit rate|link transfers/i, 'Image representation and size/transfer calculations connect to OCR 1.4.1 and networking concepts; they apply the compression idea rather than specify a particular compression algorithm.')
        ]
      },
      coding: {
        ref: '1.3.1(b)', core: 'Run-length encoding and dictionary coding for lossless compression, including practical encoding/decoding with small examples.',
        notes: [
          extra(/header|8-bit count|16-bit RLE|16-bit RLE pairs|maximum count|8-bit length|2-bit reference|token rules|word\/space|punctuation token|ceil\(log|fixed-width dictionary|minimum reference width/i, 'The exact fields, count limits, headers, token rules and reference widths are supplied teaching-format assumptions. OCR requires the coding principles, not memorising this site’s format.')
        ]
      },
      encryption: {
        ref: '1.3.1(c)', core: 'Why encryption is needed and how symmetric/asymmetric encryption and their keys are used to encrypt and decrypt data. Explaining the key arrangements is core content.',
        notes: [
          extra(/AES|RSA|GCM|OAEP|nonce|IV\b|padding randomness|randomised parameters|fresh randomness|fresh random|browser cryptography|authentication tag|authenticated encryption|verifies the authentication|failed verification/i, 'Named algorithms, modes, nonces/IVs, padding, randomness and authentication tags are implementation detail beyond the named symmetric/asymmetric requirement.'),
          extra(/certificate|key’s ownership|ownership must|ownership matters|public key[^.!?]{0,60}verif|verif[^.!?]{0,60}public key|authenticat(?:e|es|ed|ing|ion of) (?:the |Bob’s |recipient’s |relevant )?(?:public key|recipient)|trusted[^.!?]{0,40}key|key[^.!?]{0,40}trusted|identity mistake|substitut|key-establishment exchange/i, 'Certificates and public-key ownership/authentication checks are extra security context. They explain real-world trust issues beyond the basic encryption/key roles.'),
          extra(/hybrid|session secret|session key|bulk data|large video|large file efficiently/i, 'Hybrid encryption and session-key establishment are extra application context; the core requirement here is understanding symmetric and asymmetric encryption.'),
          extra(/signature|confidentiality hides|integrity detects|authentication concerns|verifying identity|detecting tampering/i, 'Digital signatures and the confidentiality/integrity/authentication distinction are supporting security context beyond this named encryption point.')
        ]
      },
      hashing: {
        ref: '1.3.1(d)', core: 'Different uses of hashing, including password storage and using hashes to store/locate data; explain the purpose and behaviour of hashing.',
        notes: [
          extra(/SHA-256|160-bit|256 bits|256-bit|64 hexadecimal|64 digits|avalanche|preimage|collision resistance/i, 'SHA-256 parameters and formal cryptographic properties are extra detail. The specification does not prescribe a named hash algorithm, digest length or internal algorithm.'),
          extra(/salt|password-hashing|key-derivation|slow password|fast SHA/i, 'Salting and purpose-designed slow password derivation add practical security context. Password storage itself remains an OCR hashing use.'),
          extra(/trusted route|attacker|authenticated.*route|valid signature|publisher|trust enters|authenticate the source/i, 'The trusted-source threat model and signatures add security context to a hash integrity check; these are not an additional named hashing algorithm requirement.'),
          extra(/toy rule|ASCII character codes|216 mod|216 and bucket|sum ignores|sum.*modulo/i, 'The character-code sum/modulo rule is an illustrative indexing function, not an OCR-prescribed hash function.'),
          related(/chaining|chain of entries|bucket 6’s chain|full keys|full key|hash-table lookup/i, 'Hash-table organisation and collision handling connect to OCR 1.4.2 (data structures); they support the hashing-use example here.')
        ]
      }
    }
  };
  // Exposed for coverage checks and future content maintenance.
  window.CSScope = scopes;
  const make = (tag, text, cls) => {const node=document.createElement(tag);node.textContent=text;if(cls)node.className=cls;return node;};
  const unit = scopes[document.body.dataset.unit];
  if (!unit) return;
  for (const [id, scope] of Object.entries(unit)) {
    const panel = document.getElementById(id);
    if (!panel || panel.querySelector('.scope-overview')) continue;
    const overview = make('aside', '', 'scope-overview');
    overview.setAttribute('aria-label', 'OCR specification scope');
    overview.append(make('p', 'OCR FOCUS · '+scope.ref, 'eyebrow'), make('p', scope.core));
    overview.append(make('p', 'Labels below distinguish “Extra context” (supporting detail beyond the named requirement) from “Related OCR content” (another specification point). Worked-example values and lab settings are teaching choices, not facts to memorise. These labels guide revision; they do not predict or exclude possible exam contexts.', 'scope-key'));
    const link = make('a', 'Check the official OCR qualification and specification');
    link.href = 'https://www.ocr.org.uk/qualifications/as-a-level-gce/computer-science-h046-h446-from-2015/';
    link.target = '_blank'; link.rel = 'noopener'; overview.append(link);
    panel.querySelector('.lesson-heading').after(overview);
    // Keep live readouts and controls untouched. Annotate their enclosing lab
    // once, since their dynamic text may be replaced by the existing simulation.
    const targets = [...panel.querySelectorAll('p, li, dd, .study-check summary')].filter(node =>
      !node.closest('.scope-overview, .lab, .readouts') && !node.classList.contains('eyebrow'));
    for (const node of targets) {
      const matches = scope.notes.filter(note => note.match.test(node.textContent));
      if (!matches.length) continue;
      const note = make('span', '', 'scope-annotation');
      for (const entry of matches) {
        const item = make('span', '', 'scope-item scope-'+entry.kind);
        item.append(make('b', entry.kind === 'extra' ? 'Extra context' : 'Related OCR content'), document.createTextNode(' · '+entry.detail));
        note.append(item);
      }
      // Keep summaries concise and preserve their accessible question names.
      if (node.tagName === 'SUMMARY') node.parentElement.append(note);
      else node.append(note);
    }
    const labs = [...panel.querySelectorAll(':scope > .lab')];
    labs.forEach(lab => {
      const notes = scope.notes.filter(note => note.match.test(lab.textContent));
      if (!notes.length) return;
      const aside = make('aside', '', 'scope-lab');
      aside.append(make('b', 'Interactive example: specification scope'));
      for (const entry of notes) aside.append(make('p', (entry.kind === 'extra' ? 'Extra context' : 'Related OCR content')+' · '+entry.detail));
      const heading = lab.querySelector('.lab-heading');
      if (heading) heading.after(aside); else lab.prepend(aside);
    });
    // Label a worked example as a whole when its assumptions or reasoning use
    // extension material, including the intermediate steps in its table.
    for (const example of panel.querySelectorAll('.study-example')) {
      const copy = [...example.querySelectorAll('h4, p, li, td')].map(node => {
        const clone = node.cloneNode(true);
        clone.querySelectorAll('.scope-annotation').forEach(n=>n.remove());
        return clone.textContent;
      }).join(' ');
      const matches = scope.notes.filter(note=>note.match.test(copy));
      if (!matches.length) continue;
      const label = make('p', matches.some(note=>note.kind==='extra') ? 'Worked example includes extra context; see the scope notes below.' : 'Worked example connects to another OCR specification point; see the scope notes below.', 'scope-example-label');
      example.querySelector('h4').after(label);
    }
    panel.dataset.scopeReady = 'true';
  }
  const review = document.getElementById('review');
  if (review) {
    const note = make('aside', 'Revision scope: these original questions practise the core topics using teaching examples. “Extra context” labels identify supporting details that are not separately named requirements. Such labels are study guidance, not a guarantee about what can appear in an exam scenario.', 'scope-overview');
    review.querySelector('.lesson-heading').after(note);
    const notes = Object.values(unit).flatMap(topic=>topic.notes);
    const fields = [...review.querySelectorAll('fieldset')];
    const annotateQuestions = () => fields.forEach(field => {
      field.querySelectorAll('.scope-question').forEach(n=>n.remove());
      const matches = notes.filter(entry=>entry.match.test(field.textContent));
      const unique = new Map(matches.map(entry=>[entry.detail,entry]));
      if (!unique.size) return;
      const aside=make('aside','','scope-question');
      for (const entry of unique.values()) aside.append(make('p',(entry.kind==='extra'?'Extra context':'Related OCR content')+' · '+entry.detail));
      field.append(aside);
    });
    annotateQuestions();
    review.querySelector('#quiz')?.addEventListener('submit', annotateQuestions);
    review.querySelector('#quiz-reset')?.addEventListener('click', annotateQuestions);
  }
  document.body.dataset.scopeReady = 'true';
})();
