class QueryFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const skip = (page - 1) * 1; //10 is limit
    this.query = this.query.skip(skip).limit(1);
    return this;
  }
  filter() {
    const filterValue = this.queryString.filter;
    if (filterValue) {
      this.query = this.query.find({
        $or: [
          { "homeTeam.name": filterValue },
          { "awayTeam.name": filterValue },
        ],
      });
    }
    return this.query;
  }
}

module.exports = QueryFeatures;
