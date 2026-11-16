window.CSStudyGuides = {
  os: {
    goal: 'Explain the operating system as a manager of shared resources and a provider of services, and trace an application request through protection checks to hardware.',
    terms: [
      ['Operating system', 'System software that manages hardware resources and provides services to programs and users.'],
      ['Process', 'A running instance of a program, with execution state and allocated resources.'],
      ['Kernel', 'The privileged core of an operating system that implements fundamental resource and protection mechanisms.'],
      ['System call', 'A controlled request by a program for an operating-system service.']
    ],
    sections: [
      ['Why applications need a manager',
        'Several programs may want the CPU, memory, a file or a printer at the same time. If every application controlled the hardware directly, it could overwrite another program’s data or leave a shared device in an inconsistent state. An operating system provides rules and mechanisms for sharing resources and protecting one user or process from another.',
        'It also provides abstraction: an application can request a file read without implementing the details of every possible disk controller. Common services make applications easier to develop and use across supported hardware. The OS cannot manufacture unlimited resources; it must decide which requests to serve, wait or refuse.'],
      ['Connect each function to its purpose',
        'Process management creates, schedules and terminates processes. Memory management allocates address space, tracks its use and helps prevent unauthorised access. File management organises files and directories, tracks locations and metadata, and enforces access permissions. Device management coordinates drivers, I/O requests and completion events.',
        'Security services identify users and control access to resources. A graphical interface or command-line interface lets people issue commands, while programming interfaces let software request services. Utilities can maintain a system, but an icon or a window is only one visible part of a much wider collection of OS functions.'],
      ['A request is checked before it is carried out',
        'An application normally runs with limited privileges. When it needs a protected service, it enters the OS through a controlled interface. The kernel checks arguments and permissions, coordinates any waiting resources, and uses appropriate lower-level services to perform the action. A denied request should not reach the device as an authorised operation.',
        'A process waiting for slow I/O need not monopolise the CPU. The OS can block it and schedule another ready process. When the I/O completes, an interrupt or completion mechanism can make the waiting process eligible to run again. This links resource management, scheduling and interrupts into one useful system.']
    ],
    examples: [
      {title: 'Trace a permitted and a denied file read', given: 'A text editor asks to open a document owned by another user. Consider the same request with and without read permission.', steps: [
        'The editor requests a file-open/read service using the OS interface, passing the file identity and requested operation.',
        'The OS checks the caller’s identity and relevant permissions. If access is denied, it returns an error; it should not issue the protected read on the caller’s behalf.',
        'If allowed, the file system locates the data. A cached copy may satisfy the request; otherwise the OS arranges device I/O through the appropriate storage stack.',
        'When the data is available, the OS returns it to the permitted application, which displays it to the user.'
      ], answer: 'The application asks for an operation; the OS manages access and execution. A friendly interface alone would not provide this protection.'},
      {title: 'Two applications want one printer', given: 'Two users submit print jobs at nearly the same time.', steps: [
        'The OS/print service stores jobs in a queue rather than allowing their raw device commands to become interleaved unpredictably.',
        'The printing system chooses an order and uses a suitable driver to communicate with the printer.',
        'While a slow printer produces pages, the CPU can execute other ready tasks. Completion or error information is returned to the relevant job.'
      ], answer: 'Queueing shares a resource in an orderly way; scheduling prevents a slow peripheral from needlessly stopping unrelated computation.'}
    ],
    lab: 'Run the file request once with access allowed and once denied. Predict the final hardware stage before advancing. Explain which OS functions the trace illustrates, then identify where an application would receive an error.',
    traps: ['The operating system is more than its GUI.', 'Application software requests services; it does not normally have unrestricted access to every hardware resource.', 'Having several processes does not guarantee that all are executing simultaneously.'],
    checks: [
      ['Name two OS functions involved when a program waits for a disk read.', 'Device management arranges the read and handles completion. Process management can block the waiting process and schedule another. Memory and file management may also be involved; explain each named function’s actual role.'],
      ['Why is checking permissions in the application alone insufficient?', 'A faulty or malicious application could bypass its own checks. Protected OS mechanisms must enforce the rules at the service/resource boundary.'],
      ['Why can a command-line-only computer still have a complete operating system?', 'A GUI is only one kind of user interface. Resource management, device services, security and program execution do not require graphical windows.']
    ],
    exam: 'For each named function, explain the resource it manages and the problem it prevents. Use the application request in the question to connect permission checks, memory, files, devices and scheduling rather than listing disconnected terms.'
  },
  memory: {
    goal: 'Translate logical addresses, explain paging and segmentation, trace a page replacement and distinguish virtual memory from extra physical RAM.',
    terms: [
      ['Page / frame', 'A fixed-size block of virtual address space / an equally sized slot in physical RAM.'],
      ['Page table', 'Information mapping virtual pages to physical frames and recording relevant status or permissions.'],
      ['Page fault', 'An exception caused by a page access that cannot currently be satisfied, such as a needed page not being resident.'],
      ['Segment', 'A variable-sized logical region, such as code, data or a stack, described using a base and a limit.']
    ],
    sections: [
      ['Addresses belong to an address space',
        'A program’s logical address is not necessarily the physical RAM location that stores its data. Hardware and OS-maintained mappings translate the request. Each process can have its own view of memory, allowing relocation and protection: one process cannot simply assume another process’s logical address refers to accessible data.',
        'With paging, divide the virtual address by the page size. The quotient identifies the page and the remainder is the offset inside it. A page-table lookup identifies the frame. The offset stays the same during translation because the page and frame have equal sizes. Pages of a process need not occupy adjacent frames.'],
      ['Demand paging and virtual memory',
        'In a demand-paged system, not every virtual page must be resident in RAM at once. When a required valid page is absent, the processor traps to the OS. The OS locates its backing data, obtains a frame, arranges the read and updates the mapping. If RAM is full, it may select a victim page; a modified victim may need writing back first.',
        'The faulting process waits while storage I/O occurs, and the instruction can be retried when the page is available. Loading from secondary storage is much slower than a RAM access. When working sets do not fit and pages are repeatedly evicted and reloaded, thrashing can dominate runtime. Virtual memory expands and organises the usable address space; it does not turn a disk into equally fast RAM.'],
      ['Segmentation and wasted space',
        'Segmentation divides a program into meaningful variable-sized regions. In a simple base-and-limit model, the segment offset must be within the limit; the physical address is base + offset. Different segments can have different permissions, such as read-only code. Segment size follows the logical region rather than a fixed page size.',
        'Variable-sized contiguous allocations can leave separated free holes: external fragmentation. A request may fail despite enough total free memory because no single hole is large enough. Paging avoids the requirement for a whole process to occupy one contiguous area, but a partially filled final page wastes space inside an allocation: internal fragmentation. Compaction can merge holes by relocating data, but needs time and relocation support.']
    ],
    examples: [
      {title: 'Translate a paged address', given: 'Pages contain 1,024 bytes. Logical address 2,500 belongs to a process whose page 2 maps to physical frame 7. Addresses and page numbers start at zero.', steps: [
        'Divide 2,500 by 1,024: page number = 2, with remainder 452. Therefore the offset is 452.',
        'Use the process’s page table: page 2 → frame 7.',
        'The frame starts at 7 × 1,024 = 7,168. Add the unchanged offset: 7,168 + 452 = 7,620.',
        'If that page were not resident, the OS would need to handle a page fault before the access could complete.'
      ], answer: 'The physical byte address is 7,620. Do not add the logical page number to the frame base; carry over only the offset.'},
      {title: 'Follow FIFO replacement', given: 'There are three initially empty frames. Access pages 0, 1, 2, 0, 3, 0. On a fault, replace the page that has been resident longest (FIFO).', steps: [
        'The first three accesses load 0, 1 and 2: three faults. The fourth access, 0, is a hit and does not change its FIFO arrival order.',
        'Access 3 faults and replaces page 0, the oldest resident page. The resident pages are now 3, 1 and 2.',
        'The last access to 0 faults again and replaces page 1. Final resident pages are 3, 0 and 2.',
        'Total faults = 5; total hits = 1. A hit does not refresh the FIFO order as it would affect recency in a different policy.'
      ], answer: 'State the policy and initial state. The same reference string can produce a different trace under a different replacement policy.'},
      {title: 'Check a segment and an allocation', given: 'A segment has base 4,000 and length 600 bytes. Separately, free memory consists of holes of 200, 300 and 100 bytes.', steps: [
        'Valid segment offsets are 0 to 599. Offset 250 translates to 4,000 + 250 = 4,250.',
        'Offset 600 is outside this segment and must not be accepted as a valid access under this limit definition.',
        'The holes total 600 bytes, but none can hold a new contiguous segment of 400 bytes. This is external fragmentation.',
        'If a 2,500-byte allocation uses 1,024-byte pages, it occupies 3,072 bytes: 572 bytes are unused within the allocated pages. This is internal fragmentation.'
      ], answer: 'Protection, address translation and allocation are related but distinct. Total free space alone does not determine whether a contiguous allocation fits.'}
    ],
    lab: 'Before advancing a page reference, predict a hit or fault and identify any FIFO victim. In the segmentation activity, compare the largest hole with total free space before and after compaction. Explain why those two quantities answer different questions.',
    traps: ['A page fault does not automatically mean the program is invalid; a valid page may simply be absent from RAM.', 'Virtual memory does not add physical RAM or match its speed.', 'Internal fragmentation is within allocated space; external fragmentation is between allocations.'],
    checks: [
      ['With 1,024-byte pages, page 3 in frame 5, where does logical address 3,100 map?', '3,100 = 3 × 1,024 + 28, so the offset is 28. Frame 5 starts at 5,120; the physical address is 5,148.'],
      ['Why might a modified victim page make a page fault more expensive?', 'Its changed contents may need writing to backing storage before the frame can be reused, adding a write to the work needed to load the requested page.'],
      ['Why can a program become much slower as more applications are opened?', 'Their combined working sets may exceed available frames. Repeated eviction and later reloading causes many page faults and slow storage transfers; heavy thrashing leaves little time for useful execution.']
    ],
    exam: 'For an address problem, show page number, offset, mapping and final address. For a page trace, show frame contents, hit/fault and victim at every step. For an explanation, connect limited RAM to replacement, storage I/O and the resulting delay.'
  },
  interrupts: {
    goal: 'Trace how a processor responds to an event without losing the interrupted program’s state, and explain interrupt priorities and the role of an ISR.',
    terms: [
      ['Interrupt', 'A signal or event requesting processor attention, potentially changing the normal flow of execution.'],
      ['ISR', 'An interrupt service routine: code that handles a particular interrupt or class of events.'],
      ['Context', 'The execution state needed to continue a program, including a return location and relevant register/status values.'],
      ['Maskable interrupt', 'An interrupt whose handling can be temporarily disabled or deferred under the processor’s rules.']
    ],
    sections: [
      ['Why not keep checking every device?',
        'A CPU is usually much faster than a keyboard, network transfer or printer. With constant polling, software repeatedly asks whether a device needs attention, potentially wasting time when nothing has changed. An interrupt lets a device or timer signal an event so the processor can do other work between events.',
        'I/O completion, a timer tick and a hardware fault are different possible sources. An interrupt is not necessarily an error. A timer interrupt can return control to the OS so it can account for elapsed time and decide whether to schedule another process. Interrupt mechanisms support useful coordination rather than simply stopping the machine.'],
      ['Fit the event into the instruction cycle',
        'In the simplified fetch–decode–execute model, the processor checks for eligible pending interrupts at an instruction boundary. If one is accepted, it preserves the state needed to resume, selects the correct ISR and transfers control. The exact hardware/OS split in saving registers varies, but sufficient context must be protected before the handler overwrites it.',
        'The ISR identifies or acknowledges the event and performs the necessary immediate work. Longer work may be deferred. On completion, saved context is restored and an appropriate return instruction resumes execution. Returning only to the correct instruction is insufficient if the accumulator or status flags have been corrupted by the handler.'],
      ['Priority, masking and responsiveness',
        'Several interrupts can be pending together. Priority rules decide which eligible event is serviced first. Masking can defer some interrupts during a critical operation or while another handler runs. A masked event may remain pending; disabled does not necessarily mean the physical event never happened.',
        'Some events use non-maskable mechanisms because of their importance. Nested handling and which priorities may interrupt a current ISR depend on the architecture and OS. For a trace question, use the supplied priority and masking rules rather than inventing a universal rule that every new interrupt immediately interrupts every instruction.']
    ],
    examples: [
      {title: 'Preserve an interrupted calculation', given: 'A program has completed an instruction. The next instruction address is 120 and the accumulator contains 8. A keyboard event is accepted. Its handler temporarily writes 99 to the accumulator.', steps: [
        'Save the return address 120 and accumulator value 8, along with any other required status/register state.',
        'Transfer control to the keyboard ISR. It reads or acknowledges the device data and may use the accumulator as working space.',
        'At ISR completion, restore the saved accumulator to 8 and restore the return location.',
        'Resume at address 120. If the saved accumulator were omitted, the program would continue with 99 and could produce an incorrect result even though it returned to the right address.'
      ], answer: 'Context preservation protects the meaning of the interrupted computation, not just the location where it resumes.'},
      {title: 'Choose between two pending events', given: 'A timer event and a keyboard event are pending. In this example, timer priority is higher. Both are maskable.', steps: [
        'If both are enabled and eligible at the next interrupt check, service the higher-priority timer event first.',
        'The keyboard request can remain pending until it becomes eligible. It should not be described as having vanished merely because it was not selected first.',
        'If maskable handling is disabled, neither request is accepted at that check. The normal program continues until the rules permit handling again.'
      ], answer: 'Specify priority and eligibility before choosing the ISR. These are stated example rules; actual systems and the lab’s configured priorities must be read separately.'}
    ],
    lab: 'Queue an event and step through saving, handling and restoring. Watch the accumulator before, during and after the ISR. Then queue both event types and use the displayed priority rules to predict the selected event. Try disabling maskable interrupts and explain the changed trace.',
    traps: ['An interrupt is not always a hardware failure.', 'An ISR must not leave the interrupted program’s working registers unintentionally changed.', 'The arrival of an interrupt and its acceptance for servicing are separate moments.'],
    checks: [
      ['Why save the program counter and accumulator?', 'The saved return location identifies where execution should continue. The saved accumulator preserves an intermediate calculation. An ISR may change both while doing its own work.'],
      ['Why are interrupts useful when reading from a slow device?', 'The processor can run other instructions rather than repeatedly polling for completion. The device signals when attention is needed, though handling the interrupt still takes time.'],
      ['How can a timer interrupt support round robin?', 'The timer can signal that a time slice has elapsed. The OS saves the current process’s context, updates the ready queue and may restore another ready process’s context so it can run.']
    ],
    exam: 'Use an ordered sequence: instruction boundary/check → eligibility and priority → save context → select and execute ISR → restore context → resume. Explain why each saved item matters to the interrupted program.'
  },
  scheduling: {
    goal: 'Construct CPU schedules, calculate waiting and turnaround times, and compare fairness, response time and throughput under the five required policies.',
    terms: [
      ['Ready / blocked', 'A ready process could run if given CPU time; a blocked process is waiting for an event such as I/O completion.'],
      ['Preemption', 'Taking the CPU away from a running process before its current CPU burst finishes.'],
      ['Time quantum', 'The maximum time slice a process receives in a round-robin turn before possible preemption.'],
      ['Turnaround / response / waiting', 'Completion minus arrival / first run minus arrival / time spent ready but not running.']
    ],
    sections: [
      ['The scheduler chooses among ready processes',
        'A process can be running, ready or blocked. A scheduler should not select a process that is still waiting for input. Policies determine which ready process runs next and whether it can be interrupted by a new arrival. Goals can conflict: maximising throughput does not necessarily minimise the delay felt by an interactive user.',
        'FCFS chooses arrival order and is normally non-preemptive for the CPU burst. A long first job can delay many short ones, a convoy effect. Non-preemptive SJF chooses the shortest available burst when the CPU becomes free; it cannot retroactively run a short job that has not arrived yet. Burst lengths are assumed known in many exam models but must be estimated in real systems.'],
      ['Three preemptive approaches',
        'Shortest remaining time compares the remaining work of the running job with ready jobs and can preempt when a shorter one arrives. Repeated short arrivals can delay a long job. Round robin rotates through the ready queue, granting up to one quantum each turn. A small quantum improves opportunities to respond but increases context-switch overhead; a very large quantum approaches FCFS behaviour.',
        'Multi-level feedback queues use several priority queues and can move a process between them based on behaviour. A CPU-bound job that consumes its time slices may be demoted, while short interactive bursts receive quick service. Promotion, ageing or periodic boosts can help avoid starvation. Exact queue counts, quantums and arrival rules are part of a particular design, not universal constants.'],
      ['Read metrics carefully',
        'Turnaround = completion time − arrival time. Response = first execution time − arrival time. For a model containing one CPU burst per job and no I/O, waiting = turnaround − burst time. Where I/O exists, blocked time must also be accounted for; it is not ready-queue waiting.',
        'Draw a time line before calculating. Mark arrivals and every decision boundary, track remaining burst time, and apply the stated tie rule. Many classroom traces ignore context-switch time; real switching has a cost. Compare the metric the scenario actually values, rather than claiming that the policy with the lowest mean waiting time must always be best.']
    ],
    examples: [
      {title: 'FCFS versus SJF for the same three jobs', given: 'A, B and C all arrive at time 0, in that order. Their CPU bursts are 6, 2 and 1 units. Ignore switching overhead.', steps: [
        'FCFS: A runs 0–6, B 6–8, C 8–9. Waiting times are 0, 6 and 8. Mean waiting = 14 ÷ 3 ≈ 4.67.',
        'SJF: C runs 0–1, B 1–3, A 3–9. Waiting times for A, B and C are 3, 1 and 0. Mean waiting = 4 ÷ 3 ≈ 1.33.',
        'Both finish all nine units of work at time 9. SJF reduces mean waiting here, but the initially first job A waits longer.',
        'Because arrival is 0, turnaround equals completion for each job. In SJF these are A = 9, B = 3 and C = 1.'
      ], answer: 'Changing order changes users’ waits even when total CPU work and final finish time are unchanged.', table: {caption: 'Single-burst metrics: FCFS and SJF', head: ['Job', 'Burst', 'FCFS wait', 'SJF wait', 'SJF turnaround'], rows: [['A',6,0,3,9],['B',2,6,1,3],['C',1,8,0,1]]}},
      {title: 'Round robin with a two-unit quantum', given: 'Use the same jobs, arriving together in queue order A, B, C. Quantum = 2. No switching overhead or I/O.', steps: [
        'A runs 0–2 and has 4 left. B runs 2–4 and finishes. C runs 4–5 and finishes.',
        'A runs 5–7 and has 2 left, then 7–9 and finishes because no other job is ready.',
        'Completion times are A = 9, B = 4, C = 5. Waiting = completion − arrival − burst, giving A = 3, B = 2 and C = 4.',
        'First response times are A = 0, B = 2 and C = 4. These differ from waiting times because A is preempted and waits after its first response.'
      ], answer: 'The CPU is shared in turns. Mean waiting is 3 units, and first-response time must not be confused with all waiting accumulated over the schedule.'},
      {title: 'A new arrival changes shortest remaining time', given: 'A arrives at 0 with burst 7. B arrives at 2 with burst 2. Use SRTF, ignore overhead and assume no other jobs.', steps: [
        'A runs from 0 to 2, leaving 5 units.',
        'At time 2, B’s 2 units are shorter than A’s remaining 5, so B preempts A and runs 2–4.',
        'A resumes 4–9. A’s turnaround is 9, and waiting is 9 − 7 = 2. B’s turnaround is 4 − 2 = 2, and waiting is 0.',
        'Under non-preemptive SJF, A would continue to time 7 because it was already running when B arrived.'
      ], answer: 'The decision depends on remaining time for SRTF and on whether the policy permits preemption.'}
    ],
    lab: 'Enter the three all-at-zero jobs from the examples, select each policy and predict the Gantt chart before finishing the trace. For round robin, vary the quantum. For feedback queues, read the model’s queue rules and explain any demotion or priority boost.',
    traps: ['Shortest job first chooses among jobs already ready, not future arrivals.', 'Response time is the first-run delay, not completion time.', 'A very small quantum is not free: context switches consume time in a real system.'],
    checks: [
      ['A job arrives at 3, first runs at 5, has one 4-unit burst and completes at 11. Find its metrics with no I/O.', 'Response = 5 − 3 = 2. Turnaround = 11 − 3 = 8. Waiting = 8 − 4 = 4; this includes ready-queue waits both before and after first running.'],
      ['Why can SJF or SRTF cause starvation?', 'A long job may repeatedly lose selection to shorter ready jobs. Continued arrivals can postpone it for a very long time; ageing or other fairness rules can mitigate this.'],
      ['Why might a feedback queue favour an interactive application?', 'An interactive task often uses short CPU bursts before blocking for user input. A feedback policy can keep such work in a high-priority queue while demoting work that repeatedly consumes full CPU slices. Exact behaviour depends on the stated rules.']
    ],
    exam: 'Show decision boundaries and remaining bursts before calculating averages. State tie rules and whether overhead is ignored. In an evaluation, relate fairness, response, starvation and switching cost to the users and workload.'
  },
  'os-types': {
    goal: 'Identify operating-system characteristics from scenario evidence and explain why deadlines, resource constraints and user sharing lead to different priorities.',
    terms: [
      ['Multitasking', 'Managing several active tasks, interleaving or parallelising their execution.'],
      ['Multi-user', 'Supporting multiple users with controlled sharing of resources and separation of their work.'],
      ['Real-time', 'Providing responses within required timing constraints; correctness depends on when results are produced.'],
      ['Distributed OS', 'Coordinating networked computers and resources while offering a more unified system view.']
    ],
    sections: [
      ['Tasks and users are different dimensions',
        'A multitasking OS can keep a browser, editor and music player active. On a single core it switches execution between ready tasks; on multiple cores some work can run simultaneously. The user experiences overlapping progress even when only one instruction stream executes at a particular instant on one core.',
        'A multi-user OS supports different users, potentially at the same time, with accounts, permissions and resource allocation. For example, a school server can run separate user sessions while protecting files. One person using several applications demonstrates multitasking; it does not, by itself, demonstrate multiple users. An OS can support both.'],
      ['A deadline is part of the required result',
        'A real-time system must respond within specified constraints, such as processing a sensor event before a control deadline. A result can be numerically correct but unusable if it arrives too late. Predictability, bounded delays and appropriate priority handling matter more than an impressive average benchmark.',
        'A hard real-time deadline cannot safely be missed for the intended requirement, while a soft real-time system can tolerate some lateness with reduced quality, such as a late media frame. Whether a system qualifies depends on its timing requirements and guarantees, not merely on whether it feels fast or controls something important.'],
      ['Embedded purpose and distributed resources',
        'An embedded OS supports a computer built into a larger product for a particular function: for example, an appliance or vehicle controller. It may be designed for limited memory, low power and reliable operation with little direct user interaction. Some embedded systems are real-time, but embedded describes placement/purpose and real-time describes timing requirements.',
        'A distributed OS coordinates resources across networked machines and can present them as parts of a more unified system. It must handle communication and partial failures: one machine or link may fail while others continue. A network of independent desktops is not automatically a distributed OS. Likewise, an ordinary cloud application can be distributed without its computers sharing one distributed operating system.']
    ],
    examples: [
      {title: 'Classify a school server and a controller', given: 'A school server hosts separate sessions for 40 students. A machine controller must react to a sensor within 5 ms and is built into the machine.', steps: [
        'The school server is multi-user because it supports distinct user sessions with controlled resources and access. It is also likely multitasking because many processes are active.',
        'The controller is embedded because it forms part of a dedicated machine rather than a general-purpose desktop.',
        'The 5 ms response requirement points to real-time needs. The correct explanation mentions the deadline, rather than saying the controller must just be “very fast”.'
      ], answer: 'Categories can overlap. Justify each with evidence rather than forcing every device into exactly one exclusive box.'},
      {title: 'Average speed versus a deadline', given: 'Controller A responds in 1 ms for nine events and 12 ms for one event. Every event has a 5 ms deadline.', steps: [
        'Mean response = (9 × 1 + 12) ÷ 10 = 2.1 ms, which is below 5 ms.',
        'The 12 ms event still misses its own deadline by 7 ms.',
        'For a hard deadline requirement, a good average does not compensate for that missed response. Worst-case bounds and the complete event-handling path matter.'
      ], answer: 'Real-time suitability cannot be established from average speed alone.'}
    ],
    lab: 'Choose an OS type for each scenario and identify the exact phrase that supports your choice. Then consider a second compatible characteristic: could the embedded controller also need real-time behaviour, or the multi-user server also be multitasking?',
    traps: ['Real-time does not simply mean the fastest computer.', 'Embedded systems do not all require the same timing guarantees.', 'Multiple networked computers do not automatically constitute a distributed OS.'],
    checks: [
      ['A single-core laptop plays music while editing a document. Is that impossible?', 'No. A multitasking OS can interleave the ready tasks sufficiently often for both to make progress. This is concurrency; simultaneous execution of those tasks would require additional execution resources.'],
      ['What extra protection does a shared server need?', 'It must separate identities and apply permissions or isolation so one user cannot freely inspect or overwrite another’s files and processes. It must also allocate shared resources fairly enough for its intended use.'],
      ['Why is a late but accurate braking command a problem?', 'The physical system continues changing while the computation runs. If the command arrives after the required deadline, it may no longer prevent the dangerous event. Timing is part of correctness.']
    ],
    exam: 'Identify the characteristic, cite the scenario requirement and explain the OS behaviour needed to satisfy it. Acknowledge overlap where appropriate; do not substitute a product name for a reason.'
  },
  bios: {
    goal: 'Explain how a computer starts before its operating system is in RAM and distinguish persistent firmware, the bootloader and the kernel.',
    terms: [
      ['BIOS', 'Basic Input/Output System: the traditional PC firmware associated with hardware initialisation and starting the boot process.'],
      ['UEFI', 'A modern firmware interface used instead of legacy PC BIOS in many systems.'],
      ['POST', 'Power-on self-test: startup checks that can identify some hardware problems.'],
      ['Bootloader', 'Software that continues the startup process and arranges loading of an operating-system kernel.']
    ],
    sections: [
      ['Solve the startup problem',
        'Ordinary RAM loses its useful contents when power is removed, so the machine cannot depend on an already running OS to load the first software. The CPU begins from an architecture-defined reset location that leads to persistent firmware. The firmware is stored in non-volatile memory, commonly rewritable flash in a modern PC.',
        'Firmware initialises enough hardware to continue startup. It may perform POST and other checks, identify available devices and consult configuration such as boot order. These checks are not an exhaustive proof that every component is fault-free; they establish enough of the initial environment and can report detected failures.'],
      ['A chain of progressively richer software',
        'A simplified boot sequence is: power/reset → firmware initialisation/checks → choose a suitable boot source → run a bootloader → load the OS kernel into RAM → initialise the OS and services. Firmware must be able to reach the next stage before the full OS device environment is available.',
        'Legacy BIOS and modern UEFI differ in their interfaces and boot arrangements, so exact steps vary. For this syllabus, understand the role and order rather than claiming every device performs an identical set of screens or tests. The kernel is the core of the running OS; firmware is not the same thing as the whole OS installed on the drive.'],
      ['Diagnose failure by the stage reached',
        'If no suitable boot device is available, firmware may still run and display an error, but the kernel cannot be loaded from that missing source. If the loader runs but cannot locate a valid OS image, failure occurs at a later stage. If a hardware check fails early, the machine may report a diagnostic before a normal display or user interface is ready.',
        'This sequence explains why replacing a storage drive does not normally erase the motherboard’s firmware, and why a firmware update is different from installing an application. Firmware persistence makes startup possible, while controlled update mechanisms allow manufacturers to correct or extend its behaviour.']
    ],
    examples: [
      {title: 'A computer with no bootable SSD', given: 'A PC powers on and passes its initial hardware checks, but its selected SSD contains no bootloader or operating system.', steps: [
        'The CPU can still start the firmware because those instructions are stored separately in non-volatile memory.',
        'The firmware attempts the configured boot sources. Under the stated conditions it finds no usable next-stage boot software on the selected SSD.',
        'Startup can stop with a boot error or try another configured source. There is no loaded kernel or ordinary desktop session from that SSD.',
        'Installing suitable boot software or selecting a valid alternative addresses this failure stage; merely adding more RAM does not supply the missing OS.'
      ], answer: 'Firmware execution and successful OS boot are separate milestones.'},
      {title: 'Put the stages in order', given: 'You are given: load kernel, initialise firmware, start user services, choose boot source, run bootloader.', steps: [
        'Initialise firmware first: this provides the initial hardware environment.',
        'Choose a suitable boot source, then execute its bootloader under the firmware’s boot rules.',
        'The loader arranges for the kernel to be loaded and started. The OS then initialises further facilities and starts services.'
      ], answer: 'Firmware → boot source → bootloader → kernel → services. A specific platform can add stages without changing the basic dependency that earlier software makes later software available.'}
    ],
    lab: 'Follow the successful startup once, then remove the boot device in the controls. Predict the first stage that cannot complete and explain which earlier software can still run.',
    traps: ['The BIOS is not loaded from the normal operating system every time the computer starts.', 'Passing POST does not guarantee there can be no hardware fault.', 'Modern firmware being updateable does not make it volatile RAM.'],
    checks: [
      ['Why must the earliest startup instructions be persistent?', 'They must remain available when RAM has lost its contents and no OS is running to retrieve them. Non-volatile firmware provides the initial executable instructions.'],
      ['Is a bootloader the same as the operating-system kernel?', 'No. A loader prepares and starts the kernel. The kernel then provides the core resource-management and protection facilities of the running operating system.'],
      ['Why could a machine report “no bootable device” while its firmware is working?', 'The firmware has executed far enough to inspect or attempt boot sources, but none supplied a usable next stage. The error concerns continuing the boot chain, not necessarily the absence of firmware.']
    ],
    exam: 'Explain the boot sequence through dependencies: persistent firmware can run before RAM contains an OS; it prepares hardware and starts a loader; the loader brings the kernel into memory. Identify the precise stage relevant to the question.'
  },
  drivers: {
    goal: 'Describe how device drivers bridge operating-system requests and hardware-specific commands, and reason about compatibility and device failures.',
    terms: [
      ['Device driver', 'Software that implements the OS-facing interface and device-specific operations needed to use particular hardware.'],
      ['Abstraction', 'Presenting a useful common interface while hiding lower-level implementation details.'],
      ['Device controller', 'Hardware that manages a device’s low-level operation and communicates with the rest of the system.'],
      ['Compatibility', 'Agreement between the relevant hardware, driver and operating-system interfaces and versions.']
    ],
    sections: [
      ['Why applications do not speak every device language',
        'A word processor should be able to request printing without containing bespoke code for every printer model. It uses an application/OS interface that describes the desired operation. The printing system and suitable driver handle the lower-level representation and commands needed by the actual device.',
        'The same principle applies to graphics, network adapters and storage controllers. A common interface supports hardware replacement without rewriting every application. The abstraction hides many details, but the underlying hardware still needs compatible commands, buffers and error handling. A driver does not remove the physical device’s own electronics or firmware.'],
      ['Follow both directions of communication',
        'A driver can configure a device, arrange transfers and translate requests into operations supported by that device. It can also interpret status information and handle completion notifications or errors. Device interaction is not simply a one-way translation of English words into electrical signals.',
        'The driver must fit the OS’s interfaces and the relevant hardware model or supported device class. Some devices use a standard class driver rather than a model-specific download. A physical connector fitting the socket establishes neither complete driver compatibility nor support for every feature.'],
      ['Failure and maintenance',
        'A missing or incompatible driver can leave a device unavailable or restrict it to basic features. A faulty driver can cause incorrect output or system instability, particularly when it operates with high privileges. Diagnosis should distinguish a software-interface problem from a disconnected cable, missing power, failed hardware or application configuration.',
        'Updates may fix bugs or add support, but using a random driver for a different model is not a sensible general repair. Correct source, intended hardware and supported OS version matter. When explaining a driver’s purpose, focus on the bridge between general requests and device-specific behaviour, not merely on the fact that software was installed.']
    ],
    examples: [
      {title: 'A print request through the layers', given: 'An editor asks to print a page containing text and an image. The printer is connected and powered on.', steps: [
        'The editor submits the page through the printing interface rather than directly driving the printer mechanism.',
        'The OS printing system coordinates the job and uses a suitable driver or print stack to produce an appropriate representation and commands.',
        'The controller receives data the printer can interpret, and its firmware/hardware performs the physical printing.',
        'Status such as completion or paper-out can travel back through the device/driver/OS path to inform the application or user.'
      ], answer: 'Application → OS services → suitable driver/device stack → controller/device, with status returning in the other direction.'},
      {title: 'Same socket, missing functionality', given: 'A new scanner fits the USB socket and appears in a device list, but the scanning application cannot acquire an image.', steps: [
        'Being electrically connected and detected is not the same as having the full scanning interface available.',
        'Check whether the OS has a compatible class or model driver and whether the application supports the provided scanning interface.',
        'Also check power, permissions and connection state. A driver is one plausible cause, not proof that every symptom has that cause.'
      ], answer: 'Compatibility has several layers. Explain which layer is failing rather than treating the connector as sufficient evidence.'}
    ],
    lab: 'Compare a suitable and an incompatible driver. Predict whether device-specific commands will be produced correctly and which stage will fail. Explain how a stable application request can have different outcomes below the OS interface.',
    traps: ['A driver is software, not the cable or port.', 'Not every peripheral needs a separate manufacturer installer; an OS may already supply a suitable driver.', 'A driver does not physically contain or replace the peripheral.'],
    checks: [
      ['Why can an application continue working after a compatible printer is replaced?', 'It uses a general printing interface. The underlying OS/driver stack can adapt the request to the new hardware, so the application need not implement both printers’ command details.'],
      ['Why must a driver match both hardware and OS requirements?', 'It must communicate correctly with the device and obey the interfaces expected by the OS. Matching only one side can still leave the other side unable to interpret requests or responses.'],
      ['Why can a driver bug have effects beyond one document?', 'A driver may handle shared hardware or execute with substantial privilege. A fault can disrupt device service or system state, affecting multiple applications; exact effects depend on the architecture and fault.']
    ],
    exam: 'Name the application’s general request, describe how the driver supports hardware-specific operation, and explain the benefit of this separation. For a fault scenario, link incompatible commands or interfaces to a concrete failure.'
  },
  vm: {
    goal: 'Distinguish a virtual computer from a language runtime, explain why virtual machines are useful, and evaluate resource and compatibility limits.',
    terms: [
      ['System VM', 'A software-managed machine environment capable of running a guest operating system.'],
      ['Hypervisor', 'Software that creates and manages virtual machines and mediates access to physical resources.'],
      ['Guest / host', 'The OS inside a system VM / the underlying machine and, in a hosted arrangement, its OS.'],
      ['Intermediate code', 'A representation such as bytecode executed by a compatible runtime rather than directly as the host CPU’s native program.']
    ],
    sections: [
      ['A whole operating system inside a virtual machine',
        'A system VM presents virtual processors, memory, storage and devices to a guest OS. The hypervisor maps those resources to the real machine. The guest behaves as though it has a machine of its own, while several guests may share one physical system. In a hosted arrangement, the virtualisation software runs above a host OS; other hypervisors run directly on the underlying platform.',
        'This supports testing a different OS, running legacy environments and consolidating lightly used servers. A guest can be stopped or replaced without deliberately changing every other guest. Snapshots can help return to an earlier VM state, but snapshot storage and recovery arrangements must still be considered; a snapshot is not automatically an independent backup.'],
      ['A runtime can also take on the role of a machine',
        'A process VM executes a program’s intermediate code through a compatible runtime. A compiler may translate source into bytecode, and the runtime interprets it or compiles parts into native instructions. Different host platforms can provide compatible runtimes for the same intermediate representation.',
        'This is not equivalent to booting a full guest OS for each application. Portability still depends on runtime versions, libraries, native dependencies and platform-specific behaviour. Nor does the presence of a VM mean any arbitrary binary for any processor will run unchanged; different instruction sets may require emulation or a different build.'],
      ['Sharing is useful but resources remain finite',
        'Guests share real CPU time, RAM, storage and I/O bandwidth. Assigning virtual CPUs does not create new physical cores. Assigning too much active memory can cause pressure and paging. A heavily loaded guest can affect others through resource contention even when their address spaces are isolated.',
        'Isolation can limit the spread of a guest failure and make disposable test environments convenient, but it is not absolute protection against every security flaw or host failure. A failure of the physical host can affect all its guests. Evaluate the convenience of consolidation and repeatable environments against management overhead, performance, licensing and the need for resilient underlying hardware.']
    ],
    examples: [
      {title: 'Plan memory for two guests', given: 'A host has 16 GB RAM. Reserve 4 GB for the host OS and management overhead. Guest A needs 6 GB of active RAM and guest B needs 5 GB. Ignore further overhead in this example.', steps: [
        'Available guest budget = 16 − 4 = 12 GB.',
        'The guests need 6 + 5 = 11 GB, so the allocation fits this simplified budget with 1 GB spare.',
        'Increasing B to 8 GB makes the active requirement 14 GB, exceeding the 12 GB budget by 2 GB.',
        'A system may refuse the allocation or overcommit and rely on additional mechanisms, but neither outcome creates extra physical RAM or guarantees good performance.'
      ], answer: 'A virtual resource is backed by finite hardware. State reserves and overhead assumptions before deciding whether allocations fit.'},
      {title: 'Choose a system VM or a process runtime', given: 'A teacher wants to test a complete guest OS safely. Separately, a developer wants one bytecode program to run on several supported platforms.', steps: [
        'Testing the guest OS needs a system VM with virtual hardware and an appropriate guest installation.',
        'Running the bytecode program needs compatible process runtimes and dependencies on each target platform, not necessarily a guest OS.',
        'A guest crash may leave other guests running, but a physical-host failure affects all environments on that host. A missing runtime or native library can still prevent the portable program from running.'
      ], answer: 'Both involve software taking on machine-like functions, but they virtualise different levels and solve different problems.'}
    ],
    lab: 'Crash one guest and observe the other. Then allocate more RAM than the displayed budget and explain the limit. Switch to the process-runtime view and identify what is executed there instead of a complete guest OS.',
    traps: ['A virtual CPU is not automatically a new physical core.', 'A language runtime and a whole-system VM are different arrangements.', 'Isolation does not make a VM invulnerable to all failures or malware.'],
    checks: [
      ['Why might a school use VMs for OS lessons?', 'Students can use separate, repeatable environments and reset them without reinstalling the main host for every exercise. Appropriate permissions and isolation reduce disruption, while resource limits and security still need management.'],
      ['A 24 GB host reserves 6 GB. Can three actively used 7 GB guests fit without overcommit?', 'No. Guest demand is 21 GB while the simplified guest budget is 24 − 6 = 18 GB. It exceeds the budget by 3 GB before any additional overhead.'],
      ['Why might bytecode fail on a machine that has a runtime installed?', 'The runtime may be an incompatible version, or required libraries/native components may be absent. Intermediate code supports portability under compatible conditions; it is not a promise about every environment.']
    ],
    exam: 'Identify whether the scenario virtualises a whole machine or executes intermediate code. Explain the layer involved, a concrete benefit and a relevant limit, such as finite RAM, shared-host failure or runtime compatibility.'
  }
};
