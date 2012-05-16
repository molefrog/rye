describe('class FactorRing', function() {
	var field3 = new PrimeField(3);
	var field7 = new PrimeField(7);
	
	var ring3 = new PolynomRing(field3);
	var ring7 = new PolynomRing(field7);
	
	var f1 = new FactorRing(ring3, ring3.polynom([1, 0, 1]));
	var f2 = new FactorRing(ring7, ring7.polynom([3]));
	
	it('has order property', function() {
		expect(f1.order).toEqual(3*3);
		expect(f2.order).toEqual(1);
	});
	
	it('has null element', function() {
		var i=0;
		expect(f1.nullElement()).toEqual(0);
		for(i=0; i<f1.order; ++i) {
			expect(f1.add(i, f1.nullElement())).toEqual(i);
		}
	});
	
	it('has one element if base is irreducible', function() {
		var i=0;
		expect(f1.oneElement()).toEqual(1);
		
		for(i=0; i<f1.order; ++i) {
			expect(f1.mul(i, f1.oneElement())).toEqual(i);
		}
	});	
	
	it('can add two elements', function() {
		expect( f1.add( 
			f1.index( ring3.polynom([1, 2])), 
			f1.index( ring3.polynom([0, 2]))
		)).toEqual(f1.index(ring3.polynom([1, 1])));	
		
		expect( f1.add( 
			f1.index( ring3.polynom([2, 2])), 
			f1.index( ring3.polynom([1, 2]))
		)).toEqual(f1.index(ring3.polynom([0, 1])));	
	});
	
	it('can multiply two element', function() {
		expect( f1.mul( 
			f1.index( ring3.polynom([0, 2])), 
			f1.index( ring3.polynom([2, 2]))
		)).toEqual(f1.index(ring3.polynom([2, 1])));	
	});
	
	
	it('can obtain opposite element', function() {
		var i=0;
		
		for(i=0; i<f1.order; ++i) {
			expect(f1.add(i, f1.opp(i))).toEqual(f1.nullElement());
		}
	});
	
	it('can obtain inverse element', function() {
		var i=0;
		
		expect(isNaN(f1.inv(f1.nullElement()))).toBeTruthy();
		
		for(i=0; i<f1.order; ++i) {
			var inv = f1.inv(i);
			if(!isNaN(inv)) {
				expect(f1.mul(i, inv)).toEqual(f1.oneElement());
			}
		}
	});

});