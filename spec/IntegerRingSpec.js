describe('class IntegerRing', function() {
	var ring = new IntegerRing();
	
	it('can be factorized', function() {
		expect(ring.factorSet(3)).toEqual([0, 1, 2]);
		expect(function() {ring.factorSet(0)}).toThrow();
	});
	
	it('can divide by a modulo', function() {
		expect(ring.mod(73, 10)).toEqual(3);
		expect(ring.mod(0, 243)).toEqual(0);
		expect(function() { ring.mod(1337, 0); }).toThrow();
	});
});