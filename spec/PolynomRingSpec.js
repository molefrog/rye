if(typeof exports === 'undefined') {
	rye = window;
} else {
 	rye    = require('../lib/rye.js');
 	should = require('chai').should(); 
}

describe('class PolynomRing', function() {
	var field = new rye.PrimeField(7);	
	var ring = new rye.PolynomRing(field);

	describe('inline class Polynom', function() {
		it('can be null polynom', function() {
			var nullPolynom = ring.polynom();
			
			nullPolynom.coefficients().should.eql([0]);
			nullPolynom.degree().should.equal(-Infinity);
			nullPolynom.app(4).should.equal(0);
			nullPolynom.app(3).should.equal(0);
		});
		
		it('has degree property', function() {
			ring.polynom([1, 1, 1, 1]).degree().should.equal(3);
			ring.polynom([0, 0, 1, 0, 0, 0, 0]).degree().should.equal(2);
		});
		
		it('can be applicabled', function() {
			ring.polynom([3, 0, 1, 5]).app(3).should.equal(0);
		});
	});
	
	it('has euclidean norm', function() {
		ring.norm( ring.polynom() ).should.equal(-Infinity);
		ring.norm( ring.polynom([1, 2, 0, 2, 0, 0, 0])).should.equal(3);
	});
	
	it('can add two polynoms', function() {
		var p1 = ring.polynom([1, 0, 2, 5]);
		var p2 = ring.polynom([6, 1, 4, 2]);
		var p3 = ring.polynom([3, 5]);
		
		ring.add(p1, p2).coefficients().should.eql([0, 1, 6]); 
		ring.add(p2, p3).coefficients().should.eql([2, 6, 4, 2]);
		ring.add(p2, ring.polynom()).coefficients().should.eql( p2.coefficients() );
	});
	
	it('can multiply two polynoms', function() {
		ring.mul( ring.polynom([0, 0, 1]), ring.polynom([0, 1])).degree().should.equal(3);
		ring.mul( ring.polynom(), ring.polynom([1, 2, 2])).degree().should.equal(-Infinity);
		ring.mul( ring.polynom([1, 2, 1]), ring.polynom([1, 2])).coefficients().should.eql([ 1, 4, 5, 2 ]);
	});
	
	it('can find an opposite polynom', function() {
		ring.opp(ring.polynom()).coefficients().should.eql( [0] );
		ring.opp(ring.polynom([0, 1, 4, 6, 0])).coefficients().should.eql([0, 6, 3, 1]);
	});
	
	it('can divide by a module', function() {
		var binaryRing = new rye.PolynomRing(new rye.PrimeField(2));
		
		binaryRing.mod( binaryRing.polynom([1, 0, 1]), binaryRing.polynom([1, 1])).coefficients().should.eql([0]);
		(function() { 
			binaryRing.mod( binaryRing.polynom[1, 0, 1], binaryRing.polynom());
		}).should.throw();
	});
	
	it('can do integer division', function() {
		var binaryRing = new rye.PolynomRing(new rye.PrimeField(2));
		
		binaryRing.div( binaryRing.polynom([1, 0, 1]), binaryRing.polynom([1, 1])).coefficients().should.eql([1, 1]);
		binaryRing.div( binaryRing.polynom([1, 0, 0, 1]), binaryRing.polynom([1, 1])).coefficients().should.eql([1, 1, 1]);
		binaryRing.div( binaryRing.polynom([1, 0, 1]), binaryRing.polynom([1, 1, 1, 1])).coefficients().should.eql([0]);
	});
	
	it('can compare two polynoms', function() {
		(ring.equal(ring.polynom(), ring.polynom([1, 2, 3]) )).should.not.be.ok;
		(ring.equal(ring.polynom(), ring.polynom()) ).should.be.ok;
		(ring.equal(ring.polynom([1, 2, 3, 0, 0, 0, 0, 0]), ring.polynom([1, 2, 3]) ) ).should.be.ok;
	});
	
	it('can build factor set', function() {
		var factorSet = ring.factorSet( ring.polynom([1, 2, 1, 1]) );
		
		(ring.equal(ring.polynom(), factorSet[0]) ).should.be.ok;
		(factorSet.length).should.equal(Math.pow(ring.field.order, 3));
		ring.factorSet(ring.polynom([1])).length.should.equal(1);
	});	
});