import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { throttle, debounce, RequestQueue, retryWithBackoff } from '../requestThrottle';

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should execute immediately on first call', () => {
    const fn = vi.fn().mockReturnValue('result');
    const throttled = throttle(fn, 1000);

    const result = throttled('arg1', 'arg2');

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(result).toBe('result');
  });

  it('should throttle subsequent calls within the delay window', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 1000);

    throttled();
    throttled();
    throttled();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should allow execution after delay has passed', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 1000);

    throttled();
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000);
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should schedule trailing call when called during throttle', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 1000);

    throttled('first');
    expect(fn).toHaveBeenCalledWith('first');

    throttled('second');
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('second');
  });
});

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should delay execution until after the delay period', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 500);

    debounced('arg');
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledWith('arg');
  });

  it('should reset the delay on each call', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 500);

    debounced('first');
    vi.advanceTimersByTime(300);
    debounced('second');
    vi.advanceTimersByTime(300);
    debounced('third');

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('third');
  });

  it('should only execute the last call in rapid succession', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    for (let i = 0; i < 10; i++) {
      debounced(i);
    }

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(9);
  });
});

describe('RequestQueue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should process requests up to max concurrency', async () => {
    const queue = new RequestQueue(2, 0);
    const results: number[] = [];

    const promise1 = queue.add(async () => {
      await new Promise((r) => setTimeout(r, 100));
      results.push(1);
      return 1;
    });

    const promise2 = queue.add(async () => {
      await new Promise((r) => setTimeout(r, 100));
      results.push(2);
      return 2;
    });

    const promise3 = queue.add(async () => {
      await new Promise((r) => setTimeout(r, 100));
      results.push(3);
      return 3;
    });

    expect(queue.active).toBe(2);
    expect(queue.pending).toBe(1);

    await vi.advanceTimersByTimeAsync(100);
    expect(results).toContain(1);
    expect(results).toContain(2);

    await vi.advanceTimersByTimeAsync(100);
    expect(results).toContain(3);

    await Promise.all([promise1, promise2, promise3]);
  });

  it('should return correct results for each request', async () => {
    const queue = new RequestQueue(3, 0);

    const promise1 = queue.add(async () => 'result1');
    const promise2 = queue.add(async () => 'result2');

    await vi.runAllTimersAsync();

    expect(await promise1).toBe('result1');
    expect(await promise2).toBe('result2');
  });

  it('should propagate errors correctly', async () => {
    const queue = new RequestQueue(3, 0);

    const promise = queue.add(async () => {
      throw new Error('Test error');
    });

    await vi.runAllTimersAsync();

    await expect(promise).rejects.toThrow('Test error');
  });

  it('should clear pending requests', async () => {
    const queue = new RequestQueue(1, 0);
    const fn = vi.fn();

    queue.add(async () => {
      await new Promise((r) => setTimeout(r, 1000));
    });

    queue.add(fn);
    queue.add(fn);

    expect(queue.pending).toBe(2);

    queue.clear();
    expect(queue.pending).toBe(0);
  });
});

describe('retryWithBackoff', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return result on success', async () => {
    const fn = vi.fn().mockResolvedValue('success');

    const promise = retryWithBackoff(fn);
    await vi.runAllTimersAsync();

    expect(await promise).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValue('success');

    const promise = retryWithBackoff(fn, { maxRetries: 3, baseDelayMs: 100 });
    await vi.runAllTimersAsync();

    expect(await promise).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should throw after max retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Always fails'));

    const promise = retryWithBackoff(fn, { maxRetries: 2, baseDelayMs: 100 });
    await vi.runAllTimersAsync();

    await expect(promise).rejects.toThrow('Always fails');
    expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });

  it('should respect shouldRetry predicate', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce({ status: 500 })
      .mockRejectedValueOnce({ status: 400 });

    const promise = retryWithBackoff(fn, {
      maxRetries: 3,
      baseDelayMs: 100,
      shouldRetry: (error) => error.status >= 500,
    });
    await vi.runAllTimersAsync();

    await expect(promise).rejects.toEqual({ status: 400 });
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should apply exponential backoff', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('Fail'))
      .mockRejectedValueOnce(new Error('Fail'))
      .mockResolvedValue('success');

    const promise = retryWithBackoff(fn, { maxRetries: 2, baseDelayMs: 1000, maxDelayMs: 10000 });

    // First call happens immediately
    expect(fn).toHaveBeenCalledTimes(1);

    // Second call after ~1000ms (with jitter)
    await vi.advanceTimersByTimeAsync(2000);
    expect(fn).toHaveBeenCalledTimes(2);

    // Third call after ~2000ms (with jitter)
    await vi.advanceTimersByTimeAsync(3000);
    expect(fn).toHaveBeenCalledTimes(3);

    expect(await promise).toBe('success');
  });
});
