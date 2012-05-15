describe('class PolynomRing', function() {
	var field = new PrimeField(7);	
	var ring = new PolynomRing(field);

	describe('inline class Polynom', function() {
		it('can be null polynom', function() {
			var nullPolynom = ring.polynom();
			
			expect( nullPolynom.coefficients() ).toEqual([0]);
			expect( nullPolynom.power() ).toEqual(-Infinity);
			expect( nullPolynom.app(4) ).toEqual(0);
			expect( nullPolynom.app(3) ).toEqual(0);
		});
		
		it('has power property', function() {
			expect( ring.polynom([1, 1, 1, 1]).power() ).toEqual(3);
			expect( ring.polynom([0, 0, 1, 0, 0, 0, 0]).power() ).toEqual(2);
		});
		
		it('can be applicabled', function() {
			expect( ring.polynom([3, 0, 1, 5]).app(3) ).toEqual(0);
		});
	});
	
	
	it('has euclidean norm', function() {
		expect( ring.norm( ring.polynom() )).toEqual(-Infinity);
		expect( ring.norm( ring.polynom([1, 2, 0, 2, 0, 0, 0]))).toEqual(3);
	});
	
	it('can construct polynom by an index', function() {
		expect( ring.element(0).coefficients() ).toEqual([0]);
		expect( ring.element(10).coefficients() ).toEqual([3, 1]);
	});
	
	it('can obtain polynom index', function() {
		expect( ring.index(ring.polynom()) ).toEqual(0);
		expect( ring.index(ring.polynom([1])) ).toEqual(1);
		expect( ring.index(ring.polynom([1, 0, 1])) ).toEqual(50);
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
		expect( ring.mul( ring.polynom([0, 0, 1]), ring.polynom([0, 1])).power() ).toEqual(3);
		expect( ring.mul( ring.polynom(), ring.polynom([1, 2, 2])).power() ).toEqual(-Infinity);
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
});