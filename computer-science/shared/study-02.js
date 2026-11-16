/* Original extended lessons. Examples use explicitly stated teaching models. */
window.CSStudyGuides = {
  risc: {
    goal: 'Explain how an instruction-set design affects the work a processor performs, then compare implementations using evidence rather than assuming one label means faster.',
    terms: [
      ['Instruction set architecture (ISA)', 'The instructions, registers and programmer-visible behaviour that machine-code software targets.'],
      ['Microarchitecture', 'The internal implementation of an ISA: pipelines, caches, execution units and other hardware choices.'],
      ['Load/store', 'An approach where explicit instructions transfer data between memory and registers; arithmetic operates on register values.'],
      ['Clock cycle', 'One timing interval of a processor. An instruction may require one or several cycles, or overlap with others.']
    ],
    sections: [
      ['What does an instruction actually do?',
        'A high-level statement such as total = total + price must ultimately become machine instructions. Some instructions move data, some perform arithmetic, and others change the next instruction to execute. The ISA defines what software may request. The circuitry that carries out that request is a separate design decision.',
        'A CISC design can provide instructions that combine several operations, use many addressing modes or directly operate on memory. This can produce compact programs and preserve compatibility with older software. However, decoding varied instruction formats and implementing complex operations can require substantial hardware or internal sequences of simpler operations.'],
      ['Why use simpler instructions?',
        'RISC designs typically favour relatively simple operations, regular instruction formats, many general-purpose registers and a load/store organisation. Regularity makes instruction decoding more predictable and can help divide execution into pipeline stages. A compiler often has to express one complex operation as several simple instructions.',
        'Pipelining overlaps stages of different instructions: while one instruction executes, another can decode and another can fetch. This improves throughput when the pipeline stays busy. It does not mean each instruction completes instantly, and branches or dependencies can stall a pipeline. RISC does not guarantee that every instruction takes exactly one cycle.'],
      ['How to make a fair comparison',
        'For a simplified single-thread model, execution time = instruction count × average cycles per instruction ÷ clock frequency. Reducing instruction count may help, but extra cycles per instruction can cancel that saving. Memory delays, cache behaviour, compiler quality and the actual workload also affect the result.',
        'An embedded controller may prioritise energy use, cost and predictable timing; a desktop may prioritise software compatibility and performance. Real processors often combine ideas associated with both traditions. Explain a typical design tendency and its consequence, then qualify it using the scenario rather than declaring a universal winner.']
    ],
    examples: [
      {title: 'The same addition through two instruction sets', given: 'A and B contain 6 and 4. We want memory location C to contain A + B. These are illustrative instructions, not a real processor ISA.', steps: [
        'A possible complex instruction is ADDMEM C, A, B. It reads both memory operands, adds them and writes 10 to C. One visible instruction still involves several internal operations.',
        'A load/store sequence could be LOAD R1, A; LOAD R2, B; ADD R3, R1, R2; STORE C, R3.',
        'After the two loads, R1 = 6 and R2 = 4. The ADD produces R3 = 10. STORE writes that result to C.',
        'Count four visible instructions in the load/store sequence and one in the complex sequence. Without cycle and clock information, that does not establish which takes less time.'
      ], answer: 'Both produce C = 10. Instruction count measures part of the work, rather than directly measuring execution time.'},
      {title: 'Calculate time rather than guessing from the label', given: 'For the same task, design A executes 800 instructions at an average 3 cycles each. Design B executes 1,200 instructions at 1.5 cycles each. Both run at 2 GHz. Ignore other delays.', steps: [
        'Design A uses 800 × 3 = 2,400 cycles. At 2 × 10⁹ cycles per second, time = 2,400 ÷ (2 × 10⁹) = 1.2 microseconds.',
        'Design B uses 1,200 × 1.5 = 1,800 cycles. Time = 0.9 microseconds.',
        'Speedup of B compared with A = 1.2 ÷ 0.9 ≈ 1.33. The reduction in execution time is (1.2 − 0.9) ÷ 1.2 = 25%.'
      ], answer: 'B finishes sooner despite executing more instructions. These numbers describe these implementations and this workload; they do not prove all RISC or CISC processors behave this way.'}
    ],
    lab: 'Before changing the ISA selector, predict which trace will contain more instructions. Step through each version and compare the final stored result. Then explain why equal work can have different instruction traces and why the displayed teaching trace is not a benchmark for real hardware.',
    traps: ['CISC does not mean a complex task always takes a single clock cycle.', 'A higher clock frequency alone cannot establish which of two different processors completes a task faster.', 'RISC and CISC describe instruction-set approaches; they do not directly specify the number of cores.'],
    checks: [
      ['A processor executes 2 million instructions at 2 cycles each and 1 GHz. What is the simplified execution time?', 'There are 4 million cycles. Divide by 1 billion cycles per second: 0.004 seconds, or 4 ms. Keep the units consistent and do not confuse GHz with instructions per second.'],
      ['Why might a designer value a regular instruction format?', 'The decoder can identify instruction fields using a more consistent structure. This can simplify decoding and support predictable pipeline stages. Connect the format to the hardware consequence rather than merely writing “RISC is efficient”.'],
      ['Why could an established CISC platform still be a sensible choice?', 'Existing compiled programs, development tools and peripherals may already target it. Compatibility can reduce replacement and migration costs; performance must still be evaluated for the intended workload.']
    ],
    exam: 'For a comparison, pair each feature with its effect: for example, a complex memory instruction can reduce visible instruction count, but its implementation may need multiple cycles. Finish with a judgement tied to compatibility, energy or the measured workload.'
  },
  gpu: {
    goal: 'Understand why GPUs excel at some parallel workloads and why adding many execution units does not automatically accelerate every program.',
    terms: [
      ['Throughput', 'The amount of work completed per unit time, such as pixels processed per second.'],
      ['Latency', 'The delay before a particular operation or request produces its result.'],
      ['Data parallelism', 'Applying similar operations to many different data items.'],
      ['Dependency', 'A need for an earlier result before a later calculation can proceed.']
    ],
    sections: [
      ['From drawing pixels to general computation',
        'Rendering a scene requires many repeated calculations: transforming vertices, determining visible surfaces and computing pixel colours. A GPU supplies many arithmetic execution resources and high memory bandwidth to keep large numbers of suitable operations in flight. A CPU typically devotes more resources to varied control flow and responsive execution of individual instruction streams.',
        'The same pattern appears outside graphics. Adjusting every pixel in an image, multiplying large matrices, or updating many particles can offer thousands of related calculations. Software must express that parallel work using an appropriate framework and supply enough data to make good use of the hardware.'],
      ['What makes a workload suitable?',
        'Ask whether many items can be processed independently using similar instructions. For example, doubling the brightness of a pixel does not normally need the brightness result for the previous pixel. Those operations can be divided among execution resources. In contrast, calculating x[n] from x[n−1] forms a dependency chain that limits simultaneous execution.',
        'Many GPUs organise work into groups that execute instructions together. If items in a group follow different branches, the hardware may have to perform different paths separately, reducing useful throughput. Data transfers, memory access patterns and synchronisation can also become bottlenecks. The number of advertised GPU units is not directly comparable with the number of CPU cores.'],
      ['Include the cost of using the accelerator',
        'A typical workflow prepares data on the CPU, transfers it to GPU-accessible memory when necessary, launches computation and retrieves the results. A tiny calculation may finish on the CPU before this setup is worthwhile. Large repeated workloads can spread the overhead over much more useful work.',
        'A GPU usually complements the CPU: the CPU coordinates applications, operating-system work and decisions, while the GPU accelerates suitable sections. Where hardware shares memory, explicit transfer costs may differ, but preparation, launch and coordination overheads still matter. Always state which costs your comparison includes.']
    ],
    examples: [
      {title: 'Independent pixels and a dependent chain', given: 'A simplified CPU processes one item per time unit. A simplified GPU processes 16 independent items per unit. There are 64 items; initially ignore setup costs.', steps: [
        'For independent pixels, the CPU needs 64 units. The GPU needs 64 ÷ 16 = 4 batches, so 4 units.',
        'The ideal speedup is 64 ÷ 4 = 16. This assumes every batch is full and all items take the same time.',
        'Now suppose item 2 needs the output of item 1, item 3 needs item 2, and so on. Only the next dependent item is ready at each step.',
        'That dependency chain needs 64 sequential steps in this model; 16 lanes cannot create independence that the algorithm does not have.'
      ], answer: 'The structure of the calculation determines usable parallelism. Hardware capacity alone does not establish the speedup.'},
      {title: 'When transfer overhead changes the decision', given: 'For one image, the CPU takes 12 ms. GPU computation takes 2 ms, preparation and transfer in take 7 ms, and transfer out takes 4 ms.', steps: [
        'Include all GPU-path costs: 7 + 2 + 4 = 13 ms.',
        'Compare 13 ms with the CPU’s 12 ms. The GPU arithmetic is faster, but the overall task is slower by 1 ms.',
        'If data already resides on the GPU and only the 2 ms computation is needed, the conclusion changes. That is a different set of assumptions.'
      ], answer: 'Choose using total end-to-end time for the actual workflow. Do not compare CPU total time with GPU arithmetic time only.'}
    ],
    lab: 'Complete the independent workload and count the batches. Switch to the dependent task and predict the new completion time before moving the slider. Explain the idle capacity using dependencies, rather than claiming the GPU has stopped working.',
    traps: ['A GPU is not faster for every kind of code.', 'Parallel execution does not remove data dependencies.', 'Machine learning is a possible GPU use because of suitable numeric workloads; the label “AI” is not itself an explanation.'],
    checks: [
      ['Why is applying the same filter to a million pixels a plausible GPU task?', 'There is a large quantity of similar numeric work that can often be divided across pixels or tiles. Some filters read neighbouring input pixels, but output pixels can still often be computed independently from the unchanged input image.'],
      ['In the 16-lane model, how many batches are needed for 70 independent items?', 'Five batches: four full batches handle 64 items and one partly filled batch handles the remaining six. Round up rather than using 70 ÷ 16 as a fractional number of batches.'],
      ['Why can a branch-heavy program use a GPU inefficiently?', 'Items in an execution group may take different branches, requiring different instruction paths to be serviced while some items do no useful work. Explain that this reduces throughput; it does not mean all branching makes GPU execution impossible.']
    ],
    exam: 'Name the workload, identify its repeated independent calculations, explain how the GPU can process them concurrently, and mention a relevant limit such as transfer overhead, branching or memory bandwidth.'
  },
  parallel: {
    goal: 'Distinguish concurrency from parallelism, explain multicore systems and calculate the limit imposed by the serial part of a program.',
    terms: [
      ['Core', 'A processing unit capable of executing an instruction stream within a processor.'],
      ['Concurrency', 'Multiple tasks make progress during overlapping periods; one core can interleave their execution.'],
      ['Parallelism', 'Multiple operations actually execute at the same time on different processing resources.'],
      ['Synchronisation', 'Coordinating cooperating tasks so that shared data and dependent results are used correctly.']
    ],
    sections: [
      ['A multicore chip and a parallel system',
        'A multicore processor places more than one processing core in the same package. Different cores can execute different threads at the same time. The operating system can run independent applications on separate cores, improving overall responsiveness even when an individual application is not designed to use many threads.',
        'Parallel processing is a wider idea: work may be spread across cores, separate processors, GPUs or networked computers. Communication within a chip can be cheaper than communication between computers, but every arrangement has finite memory bandwidth, communication costs and coordination requirements. More cores and a higher clock frequency are different changes.'],
      ['Dividing a job safely',
        'A programmer identifies work that can proceed independently, creates tasks and combines their results. Searching different parts of a dataset is a useful example. Dependencies impose order: a report cannot use a total until the partial totals have been computed and combined. The slowest partition may determine when the next stage can start.',
        'Shared writable data needs care. If two threads both read a counter value of 10 and each writes back 11, one increment is lost. Locks or atomic operations can protect updates, but waiting reduces parallel progress. This is a race condition, not evidence that addition itself is unreliable.'],
      ['The serial fraction sets a ceiling',
        'If fraction s of the one-core runtime must remain serial, the ideal runtime on n cores is T₁ × [s + (1 − s)/n]. The serial part is unchanged; only the parallel part is divided among the cores. Ideal speedup is 1 ÷ [s + (1 − s)/n]. These are useful bounds, not guaranteed real-world measurements.',
        'Even infinitely many cores cannot remove the serial time. With a 25% serial fraction, the theoretical maximum speedup is 1 ÷ 0.25 = 4. Real results can be worse because of thread management, unequal workloads, shared-cache or memory contention and communication. Improving the algorithm’s serial section can help more than buying extra cores.']
    ],
    examples: [
      {title: 'A 100-unit job on four cores', given: 'A task takes 100 time units on one core. Half the runtime is serial and half can be divided perfectly. Ignore all overhead.', steps: [
        'Serial work = 0.5 × 100 = 50 units. It still takes 50 units on four cores.',
        'Parallel work = 50 units. On four cores this takes 50 ÷ 4 = 12.5 units.',
        'Total time = 50 + 12.5 = 62.5 units. Speedup = 100 ÷ 62.5 = 1.6.',
        'On eight cores, time = 50 + 50 ÷ 8 = 56.25 units. Doubling from four to eight cores saves only 6.25 units.'
      ], answer: 'Four cores give a 1.6× speedup here. The maximum possible speedup approaches 2× because at least 50 units remain serial.'},
      {title: 'Divide a search and combine the answers', given: 'A list contains 1,000 records. Four workers can search separate blocks of 250 records at one record per time unit. Preparing the job takes 20 units and combining the results takes 10.', steps: [
        'Each worker searches its block in 250 units; the four searches overlap, so the search stage is 250 units rather than 1,000.',
        'Add preparation and combination: 20 + 250 + 10 = 280 units.',
        'The equivalent one-worker workflow takes 20 + 1,000 + 10 = 1,030 units. Speedup = 1,030 ÷ 280 ≈ 3.68.'
      ], answer: 'Independent blocks enable parallelism, but the fixed preparation and combination costs prevent a perfect fourfold improvement.'}
    ],
    lab: 'Keep four cores and increase the serial fraction from 0% to 50% to 100%. Predict the completion time at each setting. Then leave the fraction at 50% and increase the cores: explain why the gains shrink even in this model without coordination overhead.',
    traps: ['Four cores do not guarantee four times the speed for a single program.', 'Several open applications demonstrate concurrency; simultaneous execution depends on the available resources.', 'Dividing data equally does not always divide processing time equally.'],
    checks: [
      ['A 200 ms job is 25% serial. Find its ideal time on four cores.', 'Serial time = 50 ms. Parallel time = 150 ÷ 4 = 37.5 ms. Total = 87.5 ms, giving a speedup of 200 ÷ 87.5 ≈ 2.29.'],
      ['Why might more cores still improve a computer running a single-threaded editor?', 'Other applications and operating-system tasks can execute on different cores while the editor uses one. The overall system may respond better even though that editor’s own computation is not divided across all cores.'],
      ['How can synchronisation both improve correctness and reduce speedup?', 'A lock can prevent conflicting updates to shared data. Threads that need the same lock must wait, introducing serial execution and coordination overhead. Correct results remain more important than an unsafe faster trace.']
    ],
    exam: 'Describe how the particular problem can be partitioned, what must remain sequential, and how results are combined. For calculations, show serial time and parallel time separately, then state the assumptions behind your ideal result.'
  }
};
