window.CSStudyGuides = {
  io: {
    goal: 'Follow information through an input–process–output system and justify device choices using the task, the user and the physical environment.',
    terms: [
      ['Input device', 'Hardware that supplies data or control signals to a computer system.'],
      ['Output device', 'Hardware through which a computer presents information or affects its surroundings.'],
      ['Sensor / actuator', 'A sensor measures a physical quantity; an actuator carries out a physical action in response to control signals.'],
      ['ADC', 'An analogue-to-digital converter represents a continuously varying input signal using discrete numeric values.']
    ],
    sections: [
      ['Follow the direction of information',
        'Classify a device relative to the computer you are describing. A keyboard supplies characters, a microphone supplies sound measurements, and a camera supplies image data: these are inputs. A monitor displays pixels, speakers produce sound and a motor turns a mechanism: these are outputs. A touchscreen combines display output with touch-position input, so it performs both roles.',
        'Some data is already digital, such as a barcode identifier decoded by a scanner. A physical quantity such as temperature varies continuously; a sensor and conversion circuitry produce a digital reading that software can compare with a threshold. The sensor detects the environment; the processor makes the decision; the actuator changes the environment.'],
      ['Monitoring and control are different',
        'A monitoring system measures conditions and records or displays them. A control system additionally changes an output to influence the measured condition. A greenhouse controller reads temperature, compares it with a target, switches a fan and measures again. This feedback loop lets later decisions respond to the effect of earlier actions.',
        'Sampling too infrequently can miss a rapid change. Resolution determines the smallest distinguishable measurement step, while accuracy concerns closeness to the true value. More digits do not automatically mean a more accurate sensor. Practical systems may use separate on/off thresholds to prevent a fan repeatedly switching when the reading fluctuates around one threshold.'],
      ['Choose a device for the scenario',
        'Identify the actual data, how quickly it changes, required precision and the conditions of use. A barcode scanner reduces manual transcription in a shop, but needs a readable code and suitable scanning conditions. A temperature sensor suits continuous greenhouse measurement; a person typing occasional readings is slower and less consistent for automatic control.',
        'Output choices depend on the audience and environment. A screen gives detailed visual information; an audible alert can attract attention when the user is looking elsewhere; an actuator carries out an action without relying on a person. Consider accessibility, background noise, gloves, weather resistance, purchase cost and maintenance. A justified choice links one of these factors to a specific requirement.']
    ],
    examples: [
      {title: 'Trace a greenhouse control decision', given: 'The fan must be on when the measured temperature is above 28 °C. It must be off at or below 28 °C. The current reading is 31 °C.', steps: [
        'The temperature sensor measures the physical quantity. Conversion circuitry supplies a digital representation of 31 °C to the controller.',
        'The processor evaluates 31 > 28, which is true. It issues a control signal to switch the fan on.',
        'The fan actuator moves air. The system samples again rather than assuming the previous action has already solved the problem.',
        'If the next reading is 27 °C, the comparison is false and the fan is switched off under this stated rule. At exactly 28 °C it is also off.'
      ], answer: 'Sensor → digital input → comparison → control signal → actuator → new measurement. A graph alone would monitor; operating the fan makes this a control system.'},
      {title: 'Choose input and output for a stockroom', given: 'Staff need to identify packaged items rapidly. The room is noisy and workers wear gloves.', steps: [
        'A barcode scanner reads the existing item identifier without staff retyping long codes, reducing keying errors and repeated data entry.',
        'A large visual confirmation can show the item and quantity. Relying only on a quiet beep is unsuitable in a noisy room.',
        'A touchscreen may display information well, but its touch input must work with the gloves. Physical buttons or a suitable scanner trigger may be more reliable for confirmation.'
      ], answer: 'The best answer combines an appropriate data-capture method with an output and interaction method suited to the people and environment.'}
    ],
    lab: 'Set the temperature first and predict whether the actuator will be on. Step through the input, comparison and output stages. Repeat below and above the threshold and describe which stage makes the decision.',
    traps: ['A sensor measures; an actuator acts. Do not describe them as interchangeable.', 'A touchscreen is both an input and an output device.', 'A larger numeric display does not prove that a sensor is more accurate.'],
    checks: [
      ['Is a system that records room temperature every minute necessarily a control system?', 'No. It is monitoring unless it also uses its measurements to influence the room, such as switching a heater. Recording and displaying values are outputs, but they do not by themselves control the physical condition.'],
      ['Why might a sensor that samples once a minute be unsuitable for a safety system?', 'A dangerous change may occur and need a response between samples. Relate the sampling interval and overall response delay to the maximum safe reaction time.'],
      ['Which components of a self-opening door are input and output?', 'A presence or motion sensor provides input. The controller decides whether opening is appropriate. The motor is an output actuator that moves the door; warning lights or sounds would be additional outputs.']
    ],
    exam: 'Use the chain requirement → device feature → consequence. For example, frequent automatic sampling allows a greenhouse controller to detect overheating without waiting for manual readings. Name both the information being captured and the action being produced.'
  },
  storage: {
    goal: 'Explain how magnetic, optical and flash storage retain data, then compare media using access patterns, capacity, durability and cost.',
    terms: [
      ['Secondary storage', 'Non-volatile storage used to retain programs and data beyond their current use in main memory.'],
      ['Random/direct access', 'Reaching a chosen location without reading every preceding item in sequence.'],
      ['Sequential access', 'Reaching data by progressing through earlier stored positions, as with magnetic tape.'],
      ['Access time / transfer rate', 'The delay in reaching data / the rate of moving data once a transfer is under way.']
    ],
    sections: [
      ['Magnetic storage: disks and tape',
        'A hard disk stores data using magnetic regions on rotating platters. A head moves to the required track, and rotation brings the required sector underneath it. Seeking and rotational delay explain why small scattered reads can be slower than reading one large continuous file. Data remains when power is removed; the mechanics still make shocks and wear relevant.',
        'Magnetic tape also retains data without power, but winds through stored positions sequentially. Reaching one file in the middle can be slow. Once positioned, a tape system can transfer a long backup efficiently. High-capacity tape can suit scheduled archives where cost per stored byte and retention matter more than instant access to individual files.'],
      ['Optical storage and flash',
        'An optical drive directs laser light at a disc and detects changes in reflected light from its recording structure. The drive interprets these changes as encoded data. Read-only discs hold manufactured content; recordable and rewritable formats use different recording technologies. Optical media can distribute fixed material without depending on a network, but need a compatible drive and careful handling.',
        'Flash memory represents data using stored electrical charge in cells. It is non-volatile and has no moving read/write head, so SSDs and memory cards tolerate movement and offer low access latency. Flash cells have finite program/erase endurance; controllers manage wear and faulty blocks. Capacity, cost, interface and controller design affect performance, so “all SSDs have the same speed” is unjustified.'],
      ['A comparison needs a workload',
        'Consider capacity, cost per byte, access pattern, transfer speed, portability, power use, physical robustness and the availability of readers. An operating-system drive performs many small reads and writes, favouring low random-access latency. A long-term archive may tolerate slow retrieval in exchange for high capacity and inexpensive media.',
        'A storage device is not a complete backup strategy. A second independent copy, access restrictions, version history and off-site protection address different risks. A fast SSD can still fail or be deleted; keeping only one copy on a more expensive medium does not eliminate those risks. Distinguish a device feature from a guarantee about the whole system.']
    ],
    examples: [
      {title: 'Select media for two very different jobs', given: 'A travelling photographer edits images on a laptop. A business stores a large weekly archive that is rarely retrieved.', steps: [
        'The laptop needs quick access to many files and must tolerate movement. A suitable SSD offers low access latency and no moving head, though price and capacity still need checking.',
        'The archive is written in large batches and usually restored as a large set. Tape can provide high capacity and low media cost; waiting to position it is more acceptable here.',
        'Tape would be a poor substitute for the laptop’s everyday working drive. An SSD-only archive may be convenient, but its price and retention arrangements must be justified separately.'
      ], answer: 'The access pattern changes the recommendation. Name the task requirement, explain the relevant mechanism, then acknowledge a trade-off.'},
      {title: 'Estimate an ideal backup duration', given: 'A 90 GB backup transfers at a sustained 150 MB/s. Use decimal units: 1 GB = 1,000 MB. Ignore setup, verification and other overheads.', steps: [
        'Convert the size: 90 × 1,000 = 90,000 MB.',
        'Time = size ÷ transfer rate = 90,000 ÷ 150 = 600 seconds.',
        'Convert to minutes: 600 ÷ 60 = 10 minutes. Real completion may be longer because positioning, many small files and verification add costs.'
      ], answer: 'The ideal transfer time is 10 minutes under the stated assumptions. Keep MB/s distinct from Mb/s: a byte contains eight bits.'}
    ],
    lab: 'Compare the moving head, tape position, optical read and flash lookup. Predict which mechanisms impose a positioning delay and which would suit a request for many scattered records. Treat the animation as a mechanism model rather than a measurement of commercial products.',
    traps: ['Magnetic tape is not random access simply because a computer controls the drive.', 'Optical does not mean every disc can be rewritten.', 'Non-volatile means data survives ordinary power removal; it does not mean data can never be lost.'],
    checks: [
      ['Why can an HDD read one large file more efficiently than many scattered small files?', 'A continuous transfer can amortise the time spent positioning the head and waiting for sectors. Scattered files may require repeated seeks and rotational waits, increasing total access overhead.'],
      ['A 40 GB transfer averages 100 MB/s using decimal units. Find its ideal duration.', '40 GB = 40,000 MB. Divide by 100 MB/s to obtain 400 seconds, or 6 minutes 40 seconds, before additional overhead.'],
      ['Why is “SSD is better because it is modern” a weak justification?', 'It names no requirement or mechanism. A stronger explanation links low access latency or shock resistance to this task and considers capacity, endurance and cost.']
    ],
    exam: 'Avoid an unqualified list of advantages. Compare the same criteria for the candidate media and explicitly connect each difference to the required access pattern, environment or budget.'
  },
  ram: {
    goal: 'Distinguish working memory, persistent firmware and secondary storage, and trace what happens to a file through loading, editing, saving and power loss.',
    terms: [
      ['Volatile', 'Requires power to retain its contents. Ordinary main RAM is volatile.'],
      ['RAM', 'Read/write main memory holding instructions and data currently in use.'],
      ['ROM', 'Non-volatile memory associated with stored instructions that are not ordinarily rewritten during normal use.'],
      ['Firmware', 'Low-level software stored in non-volatile memory that controls or initialises hardware.']
    ],
    sections: [
      ['What a running program needs',
        'Programs and files usually reside on secondary storage when they are not in use. Starting an application loads the required instructions and data into RAM. The CPU fetches instructions and accesses working data through the memory hierarchy; RAM provides much quicker working access than repeatedly retrieving every item from a typical secondary-storage device.',
        'An edit changes the working copy in memory. Saving is a separate action that writes an updated representation to persistent storage. Applications may implement autosave or recovery, but the principle remains: changes survive power loss only if an appropriate persistent copy has actually been written. RAM capacity is not the same as the capacity available for saved files.'],
      ['Why startup instructions cannot depend on ordinary RAM',
        'After power has been removed, ordinary RAM does not retain a usable copy of the operating system or startup program. A machine needs some persistent instructions that can run first and begin hardware initialisation and the boot process. ROM-family memory provides that non-volatile starting point.',
        '“Read only” is an important characteristic, but technologies differ. Some ROM is permanently programmed; other forms can be programmed or erased under particular conditions. Modern PC firmware is commonly stored in rewritable flash, allowing updates. During ordinary startup, the stored firmware is read; updating it is a separate controlled operation.'],
      ['Compare by role, volatility and access',
        'For an exam comparison, say what is stored, whether it survives power removal, and how it is normally modified. RAM holds changing program state, such as the current contents of an unsaved document. Firmware memory retains startup/control instructions. An SSD retains application files and saved documents, but being non-volatile does not make every SSD “ROM”.',
        'More RAM can let a system keep more active data resident and reduce reliance on paging to secondary storage. It does not automatically speed every calculation: the CPU, program and dataset can be limiting factors. More secondary-storage capacity lets a user retain more files; it does not directly supply more working RAM.']
    ],
    examples: [
      {title: 'Trace three copies through a power cut', given: 'An SSD contains “Version 1”. The document is loaded and edited to “Version 2”, but the user has not saved. The firmware is stored separately in non-volatile memory.', steps: [
        'Loading creates a working copy in RAM. Editing changes that copy to Version 2; the saved SSD file is still Version 1.',
        'Power is lost. The ordinary RAM copy is lost, while the SSD copy and firmware remain.',
        'On restart, firmware begins the startup process. Reopening the saved file retrieves Version 1.',
        'If the user had completed a save before the power cut, Version 2 would have replaced or supplemented the persistent file according to the application’s save scheme.'
      ], answer: 'Without a successful save or recovery copy, the unsaved edits are lost. The computer can still start because the startup firmware does not depend on volatile RAM retention.'},
      {title: 'Choose the upgrade that matches the symptom', given: 'A laptop has plenty of free SSD space but becomes slow when many large applications are open. Monitoring shows heavy paging.', steps: [
        'Free SSD capacity does not establish that there is enough RAM for the active working sets.',
        'Heavy paging indicates that required pages are repeatedly being transferred between RAM and backing storage, adding delays.',
        'More RAM may reduce those transfers if insufficient resident memory is the bottleneck. Confirm with measurements; do not promise that adding RAM fixes every cause of slowness.'
      ], answer: 'Match the upgrade to the constrained resource. Working memory and saved-file capacity solve different problems.'}
    ],
    lab: 'Edit without saving and switch the power off. Predict which version will return. Then repeat after saving and explain every retained and lost copy, including why the firmware remains available.',
    traps: ['RAM is not a permanent location for an unsaved document.', 'ROM and secondary storage are both non-volatile, but they have different roles.', 'Firmware can be updateable without making ordinary RAM non-volatile.'],
    checks: [
      ['A student saves Version 3, edits to Version 4, then loses power. Which saved version remains?', 'Version 3, assuming the save completed and there is no separate autosave/recovery copy. Version 4 existed only in volatile working memory.'],
      ['Why can the operating system not be the only software needed to load itself from an SSD?', 'Some instructions must already be available to initialise enough hardware and start the loading process before the OS is resident. Persistent firmware provides that starting point.'],
      ['Does a 1 TB SSD mean that the computer has 1 TB of RAM?', 'No. The figure describes secondary-storage capacity. RAM is a separate working-memory resource with its own capacity and volatility.']
    ],
    exam: 'Use a concrete item to explain the distinction: the unsaved document is working data in volatile RAM, whereas a completed save is retained on non-volatile secondary storage and startup instructions are retained in firmware memory.'
  },
  'virtual-storage': {
    goal: 'Explain how a logical storage service hides physical placement, evaluate remote access and distinguish synchronisation, replication, backup and virtual memory.',
    terms: [
      ['Logical location', 'The path, drive or object name presented to software or a user.'],
      ['Physical location', 'The actual device or devices storing the data.'],
      ['Replication', 'Keeping multiple copies, often to improve availability or resilience to a device failure.'],
      ['Synchronisation', 'Propagating changes between copies so they reflect the same current state.']
    ],
    sections: [
      ['One interface, potentially many devices',
        'Virtual storage presents a logical resource independently of the physical arrangement underneath. A user may see a folder or drive without knowing which disk or server holds each file. The service maps that logical location to physical storage and may move, split or replicate the data while retaining a familiar user-facing name.',
        'A remote cloud-storage service is a common example, but storage virtualisation does not have to mean the public internet. An organisation can combine local or networked devices behind a logical storage pool. What matters is the abstraction between the storage interface and physical placement. The data still occupies real storage somewhere.'],
      ['Benefits come with dependencies',
        'Remote storage can make the same files accessible from several devices, support sharing and let a provider manage capacity or failed drives. Users may not have to replace a local disk when their allocation grows. Access controls can determine who may read, modify or share individual resources.',
        'If a required file is remote and has no usable local copy, losing the connection can prevent access. Slow bandwidth affects large transfers; latency affects repeated requests. Offline caching can help, but creates questions about freshness and conflicting edits. Provider costs, account security, service availability and where data is physically stored can influence suitability.'],
      ['A synced copy is not automatically a backup',
        'Replication helps when one physical copy becomes unavailable. Synchronisation keeps files consistent, including propagating accidental edits or deletions. If the same damaging change reaches every current copy, having several synchronised replicas does not restore the older version. A backup needs recoverable data from an appropriate earlier point, with retention and access arrangements that protect it.',
        'Virtual storage is also different from virtual memory. Storage virtualisation concerns how persistent storage is presented and located. Virtual memory concerns the address space used by processes and may use secondary storage to back pages that are not in RAM. Similar names do not mean the mechanisms or purposes are interchangeable.']
    ],
    examples: [
      {title: 'The same path after a physical move', given: 'A student opens /coursework/report.txt. The storage service moves its contents from server A to server B overnight.', steps: [
        'The logical name is the path the student uses. The physical placement was server A and is now server B.',
        'The service updates its mapping so a request for the same logical path reaches the current physical data.',
        'If the student has no local copy and the network fails, the unchanged path cannot make the remote contents reachable.',
        'If a complete offline copy was previously cached, it may remain readable, subject to the application’s permissions and offline behaviour.'
      ], answer: 'Location transparency makes physical changes less visible. It does not remove the need for working storage devices, permissions or a network when data is remote.'},
      {title: 'Deletion across three synchronised devices', given: 'A folder is synchronised between a laptop, a desktop and a remote service. A user accidentally deletes an important file.', steps: [
        'Synchronisation may correctly propagate that deletion to all three current copies.',
        'Check for retained versions, a recycle bin or a separately protected backup rather than assuming a current replica contains the missing file.',
        'To improve recovery, retain independent historical copies and test restoring them. Restrict deletion rights where appropriate.'
      ], answer: 'Availability of the latest state and recoverability of an earlier state are distinct requirements.'}
    ],
    lab: 'Move the physical file while watching the logical location. Then disconnect the network with and without an offline copy. Predict accessibility each time and explain what the abstraction hides and what it cannot hide.',
    traps: ['“Virtual” does not mean that no physical storage is required.', 'A synchronised deletion may remove every current copy.', 'Virtual storage and virtual memory address different problems.'],
    checks: [
      ['Why can a cloud folder be visible while a particular file cannot be opened?', 'The folder listing or file name may be cached locally, while the complete file contents remain remote. A visible logical name does not prove that an accessible local copy exists.'],
      ['Give one benefit and one risk of storing coursework remotely.', 'A benefit is access from multiple devices or controlled sharing. A relevant risk is loss of access during a network/service outage, or propagation of accidental changes. Explain whether offline copies and retained versions mitigate that particular risk.'],
      ['Can a local storage pool be virtualised?', 'Yes. Multiple local devices can be presented as a single logical resource. The defining feature is separation of logical presentation from physical placement, rather than a requirement to use the public internet.']
    ],
    exam: 'Start with logical versus physical placement, then apply the scenario. Explain how an actual feature helps and what dependency or failure remains. Distinguish access, availability and recovery rather than calling the whole service “safe”.'
  }
};
