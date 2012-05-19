describe('class PolynomRing', function() {
	var field = new PrimeField(7);	
	var ring = new PolynomRing(field);

	describe('inline class Polynom', function() {
		it('can be null polynom', function() {
			var nullPolynom = ring.polynom();
			
			expect( nullPolynom.coefficients() ).toEqual([0]);
			expect( nullPolynom.degree() ).toEqual(-Infinity);
			expect( nullPolynom.app(4) ).toEqual(0);
			expect( nullPolynom.app(3) ).toEqual(0);
		});
		
		it('has degree property', function() {
			expect( ring.polynom([1, 1, 1, 1]).degree() ).toEqual(3);
			expect( ring.polynom([0, 0, 1, 0, 0, 0, 0]).degree() ).toEqual(2);
		});
		
		it('can be applicabled', function() {
			expect( ring.polynom([3, 0, 1, 5]).app(3) ).toEqual(0);
		});
	});
	
	it('has euclidean norm', function() {
		expect( ring.norm( ring.polynom() )).toEqual(-Infinity);
		expect( ring.norm( ring.polynom([1, 2, 0, 2, 0, 0, 0]))).toEqual(3);
	});
	
	it('can add two polynoms', function() {
		var p1 = ring.polynom([1, 0, 2, 5]);
		var p2 = ring.polynom([6, 1, 4, 2]);
		var p3 = ring.polynom([3, 5]);
		
		expect( ring.add(p1, p2).coefficients() ).toEqual([0, 1, 6]); 
		expect( ring.add(p2, p3).coefficients() ).toEqual([2, 6, 4, 2]);
		expect( ring.add(p2, ring.polynom()).coefficients() ).toEqual( p2.coefficients() );
	});
	
	it('can multiply two polynoms', function() {
		expect( ring.mul( ring.polynom([0, 0, 1]), ring.polynom([0, 1])).degree() ).toEqual(3);
		expect( ring.mul( ring.polynom(), ring.polynom([1, 2, 2])).degree() ).toEqual(-Infinity);
		expect( ring.mul( ring.polynom([1, 2, 1]), ring.polynom([1, 2])).coefficients() ).toEqual([ 1, 4, 5, 2 ]);
	});
	
	it('can find an opposite polynom', function() {
		expect( ring.opp(ring.polynom()).coefficients() ).toEqual( [0] );
		expect( ring.opp(ring.polynom([0, 1, 4, 6, 0])).coefficients() ).toEqual([0, 6, 3, 1]);
	});
	
	it('can divide by a module', function() {
		var binaryRing = new PolynomRing(new PrimeField(2));
		
		expect( binaryRing.mod( binaryRing.polynom([1, 0, 1]), binaryRing.polynom([1, 1])).coefficients() ).toEqual([0]);
	});
	
	it('can compare two polynoms', function() {
		expect( ring.equal(ring.polynom(), ring.polynom([1, 2, 3]) )).toBeFalsy();
		expect( ring.equal(ring.polynom(), ring.polynom()) ).toBeTruthy();
		expect( ring.equal(ring.polynom([1, 2, 3, 0, 0, 0, 0, 0]), ring.polynom([1, 2, 3]) ) ).toBeTruthy();
	});
	
	it('can build factor set', function() {
		var factorSet = ring.factorSet( ring.polynom([1, 2, 1, 1]) );
		
		expect( ring.equal(ring.polynom(), factorSet[0]) ).toBeTruthy();
		expect( factorSet.length).toEqual(Math.pow(ring.field.order, 3));
		expect( ring.factorSet(ring.polynom([1])).length).toEqual(1);
	});	
});