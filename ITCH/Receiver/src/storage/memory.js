let memory = [];

module.exports = {
  clear: () => {
    memory = [];
  },
  insert: (record) => {
    memory.push(record);
    return record;
  },
  loadAll: (records) => {
    memory = records;
  },
  getLastSequence: () => {
    if (memory.length === 0) return 0n;
    return memory[memory.length - 1].seq;
  },
  count: () => {
    return memory.length;
  },
  getAll: () => {
    return memory;
  }
};
