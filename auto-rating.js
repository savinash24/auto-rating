const metric_type = 1
const calc_type = 2
const lower_bound = 1
const kr_start = 0
const kr_end = 100
const tactual = 99
const type = 1 // 1 = asc 2 = desc

let ratings =
    // DESC
    // [
    //     { "rating_level": "1", "score": "30.00", "target": "100.00", "rating_name": "E" },
    //     { "rating_level": "2", "score": "60.00", "target": "80.00", "rating_name": "D" },
    //     { "rating_level": "3", "score": "70.00", "target": "70.00", "rating_name": "C" },
    //     { "rating_level": "4", "score": "80.00", "target": "50.00", "rating_name": "B" },
    //     { "rating_level": "5", "score": "100.00", "target": "20.00", "rating_name": "A" }
    // ]
    // ASC
    [
        { "rating_level": "1", "score": "30.00", "target": "20.00", "rating_name": "A" },
        { "rating_level": "2", "score": "60.00", "target": "50.00", "rating_name": "B" },
        { "rating_level": "4", "score": "80.00", "target": "80.00", "rating_name": "D" },
        { "rating_level": "3", "score": "70.00", "target": "70.00", "rating_name": "C" },
        { "rating_level": "5", "score": "100.00", "target": "100.00", "rating_name": "E" }
    ]

ratings = ratings.sort((a, b) => a.rating_level - b.rating_level);

// console.table(ratings);
// let exp = `if(target == null || target == 'undefined) { return {}}')`
const ratingObj = {}
const minRatingDetails = ratings?.[0] || {}
ratingObj[0] = minRatingDetails
const r_length = ratings.length - 1
const maxRatingDetails = ratings?.[r_length] || {}
console.log({ maxRatingDetails });
const expessionArray = []
for (const [index, r] of ratings.entries()) {
    console.log(index, r);
    if (type == 2) {
        console.log("DESC CONFIG");
        // DESC
        // tmin and tmax is adjusted to fit the formula
        if (index == 0) {
            r.tmin = r.target
            r.tmax = ratings[index + 1].target
            r.smin = 0
            r.smax = r.score
            r.rmin = 0
            r.rmax = r.rating_level
            expessionArray.push(`else if (tactual > ${r.tmax}) {return ${r.rating_level}}`)
        }
        else if (index == r_length) {
            r.tmin = r.target
            r.tmax = ratings[index - 1].target
            r.smin = ratings[index - 1].score
            r.smax = r.score
            r.rmin = ratings[index - 1].rating_level
            r.rmax = r.rating_level
            expessionArray.push(`else if (tactual <= ${r.tmin}) {return ${r.rating_level} }`)
        }
        else if (index < r_length) {
            r.tmin = r.target
            r.tmax = ratings[index + 1].target
            r.smin = ratings[index - 1].score
            r.smax = r.score
            r.rmin = ratings[index - 1].rating_level
            r.rmax = r.rating_level
            expessionArray.push(`else if (tactual > ${r.tmax} && tactual <= ${r.tmin}) {return ${r.rating_level}}`)
        }
    } else {
        // ASC
        console.log("ASC CONFIG");
        if (index == 0) {
            r.tmin = kr_start
            r.tmax = r.target
            r.smin = 0
            r.smax = r.score
            r.rmin = 0
            r.rmax = r.rating_level
            expessionArray.push(`else if (tactual <= ${r.tmax}) {return ${r.rating_level}}`)
        }
        else if (index == r_length) {
            r.tmin = ratings[index - 1].target
            r.tmax = r.target
            r.smin = ratings[index - 1].score
            r.smax = r.score
            r.rmin = ratings[index - 1].rating_level
            r.rmax = r.rating_level
            expessionArray.push(`else if (tactual > ${r.tmin}) {return ${r.rating_level} }`)
        }
        else if (index < r_length) {
            r.tmin = ratings[index - 1].target
            r.tmax = r.target
            r.smin = ratings[index - 1].score
            r.smax = r.score
            r.rmin = ratings[index - 1].rating_level
            r.rmax = r.rating_level
            expessionArray.push(`else if (tactual > ${r.tmin} && tactual <= ${r.tmax}) {return ${r.rating_level}}`)
        }
    }
    ratingObj[r.rating_level] = r
}
// console.log(ratingObj);
console.table(ratings);
// let inc_inner_exp = ''
const inc_exp = `if (tactual == null || tactual == 'undefined' || tactual < 0) {return null} ${expessionArray.join(' ')} else {return null}`
console.log({ inc_exp });
let fetchScore = new Function('tactual', inc_exp)

function fetchInterpolatedScore(details) {
    let score = 0
    try {
        let ta = details.tactual
        if (details.type == 2 && (details.tactual > details.tmin)) {
            ta = details.tmin
        }
        score = +details.smin + +(((ta - details.tmin) * (details.smax - details.smin)) / (details.tmax - details.tmin))
        console.log(`${details.smin} + (${ta} - ${details.tmin}) * (${details.smax} - ${details.smin}) / (${details.tmax} - ${details.tmin})`);
        score = score > details.max_score ? details.max_score : score
    } catch (error) {
        console.log(error);
    }

    console.log({ score });
    return parseFloat(score).toFixed(2)
}
function fetchInterpolatedRating(details) {
    let rating = 0
    try {
        rating = +details.rmin + +(((details.final_score - details.smin) * (details.rmax - details.rmin)) / (details.smax - details.smin))
        rating = rating > details.max_rating ? details.max_rating : rating
    } catch (error) {
        console.log(error);
    }
    console.log({ rating });
    return parseFloat(rating).toFixed(2)
}

let finalDetails = null
finalDetails = ratingObj[fetchScore(tactual)]
console.log(finalDetails);
if (finalDetails) {
    finalDetails.type = type
    finalDetails.max_score = maxRatingDetails.score
    finalDetails.max_level = maxRatingDetails.rating_level
    finalDetails.tactual = tactual
    const final_score = calc_type == 1 ? finalDetails.smax : fetchInterpolatedScore(finalDetails)
    finalDetails.final_score = final_score
    const final_rating = calc_type == 1 ? finalDetails.rmax : fetchInterpolatedRating(finalDetails)
    finalDetails.final_rating = final_rating
} else {
    finalDetails = {}
    finalDetails.final_score = null
    finalDetails.final_rating = null
}
console.log(finalDetails)
