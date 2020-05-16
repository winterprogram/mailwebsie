const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('./../index');
const should = chai.should();

chai.use(chaiHttp);


describe('get all coupon for user', function () {

    it('should list all coupon on /fetchCouponUser GET', function (done) {
        chai.request(server)
            .get('/fetchCouponUser').set('userid','FmTD3G')
            .end(function (err, res) {
                should.not.exist(err);
                console.log(res.body.status)
                // res.should.have.status(200);
                res.body.should.have.property('status')
                res.body.status.should.equal(200)
                res.body.should.be.a('object');
                res.body.should.have.property('error');
                res.should.be.json;
                done();

            })
    })

    it('should distribute coupon to user from merchant', function (done) {
        chai.request(server)
            .post('/coupontouser').set({userlatitude:"18.993292",userlongitude:"73.115773",userid:'FmTD3G'})
            .end(function (err, res) {
                should.not.exist(err);
                //  console.log(res.body.status)
                // res.should.have.status(200);
                res.body.should.have.property('status')
                res.body.status.should.equal(200)
                res.body.should.be.a('object');
                res.body.should.have.property('error');
                res.should.be.json;
                done();

            })
    })
})