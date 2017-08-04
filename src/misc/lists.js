class Node {
  constructor(data) {
    this.data = data;
    this.prev = null;
    this.next = null;
  }
}

export class DoublyLinkedList {
  constructor() {
    this.first = null;
    this.last = null;
    this.length = 0;
  }

  // Add to the front
  unshift(data) {
    if (!this.first) {
      // First to add
      this.first = new Node(data);
      this.last = this.first;
    } else {
      const newFirst = new Node(data);
      newFirst.next = this.first;
      this.first.prev = newFirst;
      this.first = newFirst;
    }
    this.length++;
    return data;
  }

  // Add to the end
  push(data) {
    if (!this.last) {
      // First to add
      this.last = new Node(data);
      this.first = this.last;
    } else {
      const newLast = new Node(data);
      newLast.prev = this.last;
      this.last.next = newLast;
      this.last = newLast;
    }
    this.length++;
    return data;
  }

  // Add at index
  add(i, data) {
    if (i < 0 || i > this.length) {
      return null;
    }
    switch (i) {
      // First node
      case 0:
        return this.unshift(data);
        break;

      // Last node
      case this.length:
        return this.push(data);
        break;

      // Middle node
      default:
        const current = this.nodeAt(i);

        const beforeNodeToAdd = current.prev;
        const nodeToAdd = new Node(data);
        const afterNodeToAdd = current;

        nodeToAdd.next = afterNodeToAdd;
        nodeToAdd.prev = beforeNodeToAdd;

        beforeNodeToAdd.next = nodeToAdd;
        afterNodeToAdd.prev = nodeToAdd;

        this.length++;
        return data;
    }
  }

  // Remove first
  shift() {
    const oldFirst = this.first;
    if (this.first) {
      if (this.last === this.first) {
        this.first = null;
        this.last = null;
      } else {
        this.first = this.first.next;
        this.first.prev = null;
      }
    }
    this.length--;
    return oldFirst.data;
  }

  // Remove last
  pop() {
    const oldLast = this.last;
    if (this.last) {
      if (this.last === this.first) {
        this.first = null;
        this.last = null;
      } else {
        this.last = this.last.prev;
        this.last.next = null;
      }
    }
    this.length--;
    return oldLast.data;
  }

  // Remove at index
  remove(i) {
    if (this.length === 0 || i < 0 || i > this.length - 1) {
      return null;
    }
    switch (i) {
      // First node
      case 0:
        return this.shift();
        break;

      // Last node
      case this.length - 1:
        return this.pop();
        break;

      // Middle node
      default:
        const current = this.nodeAt(i);

        const beforeNodeToDelete = current.prev;
        const nodeToDelete = current;
        const afterNodeToDelete = current.next;

        beforeNodeToDelete.next = afterNodeToDelete;
        afterNodeToDelete.prev = beforeNodeToDelete;

        this.length--;
        return nodeToDelete.data;
    }
  }

  nodeAt(i) {
    // Starting position based on length and index.
    // We choose what ever is closest to the node at `i`
    if (this.length / 2 - (i + 1) < 0) {
      let current = this.last;
      // Go down until we reach the node
      for (let count = 0; count < this.length - i - 1; count++) {
        current = current.prev;
      }
      return current;
    } else {
      let current = this.first;
      // Go up until we reach the node
      for (let count = 0; count < i; count++) {
        current = current.next;
      }
      return current;
    }
  }

  each(func) {
    let current = this.first;
    while (current) {
      func(current.data);
      current = current.next;
    }
  }

  toString() {
    const array = [];
    this.each(val => array.push(val));
    return array.join("");
  }
}
